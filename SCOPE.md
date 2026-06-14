# SCOPE.md — Data Anomaly Log & Database Schema

This document covers two things:
1. The complete database schema and the reasoning behind each design choice.
2. Every data quality problem found in `expenses_export.csv` — how each was detected, what action was taken, and why.

---

## Part 1: Database Schema

### Overview

The schema is defined in `server/prisma/schema.prisma` — a single file that is the authoritative source of truth for the entire database structure.

```
User ──< GroupMembership >── Group
                │                │
                │                ├──< Expense ──< ExpenseSplit
                │                ├──< Settlement
                │                └──< ImportLog
                └── (resolvedLogs)
```

---

### Table: `User`

| Column | Type | Notes |
|--------|------|-------|
| id | Int (PK, autoincrement) | |
| email | String (UNIQUE) | Used for login |
| username | String (UNIQUE) | Display name, also used as a key when auto-creating CSV members |
| password | String | Bcrypt hash (10 rounds) |
| createdAt | DateTime | Auto-set on insert |

**Why:** Minimal user model — only what's needed for auth. No profile bloat.

---

### Table: `Group`

| Column | Type | Notes |
|--------|------|-------|
| id | Int (PK) | |
| name | String | e.g. "Flat 4B" |
| description | String | Optional, defaults to "" |
| defaultCurrency | String | "INR" default |
| createdAt | DateTime | |
| createdById | Int (FK → User) | Who created the group |

---

### Table: `GroupMembership` ⭐ (most important table)

| Column | Type | Notes |
|--------|------|-------|
| id | Int (PK) | |
| groupId | Int (FK → Group) | |
| userId | Int (FK → User) | |
| displayName | String | The name that appears in expenses (e.g. "Aisha") |
| joinedAt | DateTime | Date the member joined the flat |
| leftAt | DateTime? | NULL = still active; set when member leaves |

**The key design insight:** A simple boolean `isActive` field cannot represent this domain. Meera was active from Feb 1 to March 31. Sam joined April 15. We need to ask "was this person a member on March 15?" — which requires date ranges, not a flag.

**Active member query:**
```sql
WHERE joinedAt <= :expenseDate
  AND (leftAt IS NULL OR leftAt >= :expenseDate)
```

**Unique constraint:** `(groupId, userId, joinedAt)` — allows a user to re-join a group (different `joinedAt`) without violating uniqueness.

---

### Table: `Expense`

| Column | Type | Notes |
|--------|------|-------|
| id | Int (PK) | |
| groupId | Int (FK → Group) | |
| description | String | |
| amount | Decimal(12,2) | Original amount in original currency |
| currency | String | "INR" or "USD" |
| exchangeRate | Decimal(10,4) | Rate used at time of import (e.g. 83.5) |
| amountInr | Decimal(12,2) | `amount × exchangeRate` — canonical value for all calculations |
| splitType | String | equal / exact / percentage / shares |
| date | Date | Used to determine which members were active |
| isSettlement | Boolean | True if the expense description flags it as a settlement |
| notes | String | Anomaly notes written at import time |
| importRow | Int? | CSV row number for traceability |
| paidById | Int (FK → GroupMembership) | Who paid |
| createdById | Int? (FK → User) | Logged-in user who created it (NULL for CSV imports) |
| createdAt | DateTime | |

**Why store both `amount` and `amountInr`?**
Storing only `amountInr` would lose the original value ($12 → ₹1002; the $12 is useful for display and audit). Storing only the original amount means every balance calculation needs currency conversion at query time. We store both: original for display/audit, INR for all math.

---

### Table: `ExpenseSplit`

| Column | Type | Notes |
|--------|------|-------|
| id | Int (PK) | |
| expenseId | Int (FK → Expense, CASCADE DELETE) | |
| memberId | Int (FK → GroupMembership, CASCADE DELETE) | |
| amountInr | Decimal(12,2) | This member's share |
| percentage | Decimal(5,2)? | For percentage splits |
| shares | Int? | For share-based splits |

One row per (expense, member). The last member in an equal split gets the remainder to avoid floating-point rounding errors (e.g. ₹100 ÷ 3 = ₹33.33 + ₹33.33 + **₹33.34**).

---

### Table: `Settlement`

| Column | Type | Notes |
|--------|------|-------|
| id | Int (PK) | |
| groupId | Int (FK → Group) | |
| paidById | Int (FK → GroupMembership) | Who sent the money |
| paidToId | Int (FK → GroupMembership) | Who received it |
| amount | Decimal(12,2) | |
| date | Date | |
| notes | String | e.g. "UPI transfer" |
| createdAt | DateTime | |

Settlements are NOT expenses. They don't create splits. They directly adjust the net balance: `paidBy.net += amount`, `paidTo.net -= amount`.

---

### Table: `ImportLog`

| Column | Type | Notes |
|--------|------|-------|
| id | Int (PK) | |
| groupId | Int (FK → Group) | |
| rowNumber | Int | CSV row number (1-indexed, row 1 = header) |
| rawData | Json | The full raw CSV row stored verbatim |
| issueType | String | See anomaly table below |
| issueDescription | String | Human-readable description |
| severity | String | error / warning / info |
| status | String | pending / approved / rejected / auto_handled |
| actionTaken | String | What the importer did |
| resolvedAt | DateTime? | When a user manually resolved it |
| resolvedById | Int? (FK → User) | Who resolved it |
| linkedExpenseId | Int? (FK → Expense) | The expense created from this row (if any) |
| createdAt | DateTime | |

Every anomaly — even info-level ones — gets its own row. This gives a complete audit trail of every decision the importer made.

---

## Part 2: CSV Anomaly Log

The company's `expenses_export.csv` contained 26 rows. During import, the following problems were detected:

---

### Anomaly 1 — Missing Description (Row 12)

**What was found:**
Row 12 had an empty `description` field. All other fields (date, amount, paid_by, split_with) were valid.

**Detection method:**
```js
const description = (row.description || row.Description || '').trim();
if (!description) issues.push({ type: 'missing_description', severity: 'warning' });
```

**Action taken:** Imported with a fallback description `"Imported expense"`. Not skipped because the financial data (who paid, how much, who splits) was complete and correct. Skipping it would silently lose a valid transaction.

**Why this policy:** A missing description is a cosmetic problem, not a financial one. The balance calculation is unaffected. The user can rename the expense later.

---

### Anomaly 2 — Invalid / Unparseable Date (Row 22)

**What was found:**
Row 22 contained `"not-a-date"` in the date field.

**Detection method:**
Multi-format date parser tried four regex patterns (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, M/D/YYYY) then fell back to `new Date(string)`. All failed.

**Action taken:** Row **skipped**. Logged as `severity: error`, `status: rejected`.

**Why skip:** The date is required for two critical operations: (1) determining which members were active at the time of the expense, and (2) computing the correct split. Without a date, we cannot safely compute either. Guessing a date would silently corrupt balances.

---

### Anomaly 3 — Missing Payer (Row 23)

**What was found:**
Row 23 had an empty `paid_by` field. Every field was tried: `paid_by`, `paidBy`, `PaidBy`, `Paid By`.

**Detection method:**
```js
const rawPaidBy = row.paid_by || row.paidBy || row['Paid By'] || '';
if (!rawPaidBy.trim()) issues.push({ type: 'missing_payer', severity: 'error' });
```

**Action taken:** Row **skipped**.

**Why skip:** Balance calculation requires knowing who paid. The payer receives credit equal to the full expense amount. Without a payer, we cannot create a valid split — any import would leave the books unbalanced.

---

### Anomaly 4 — Negative Amount (Row 26)

**What was found:**
Row 26 had amount `-₹200` (a deposit refund).

**Detection method:**
After stripping currency symbols, `parseFloat("-200") = -200 < 0`.

**Action taken:** Row **skipped**, flagged for user review as a potential refund or data entry error.

**Why skip:** A negative amount could mean three different things: a refund, an inverted sign convention, or a data entry mistake. Importing it as a negative expense would corrupt balances. We surface it so the user can manually decide whether to log it as a settlement instead.

---

### Anomaly 5 — Settlement Logged as Expense (Row 20)

**What was found:**
Row 20 had description `"Rohan paid back Aisha settle up"` — clearly a settlement between two people, not a shared expense.

**Detection method:**
```js
const isSettlement = description.toLowerCase().includes('settlement')
  || description.toLowerCase().includes('settle up')
  || description.toLowerCase().includes('paid back');
```

**Action taken:** Imported but flagged with `isSettlement: true`. Not skipped because the financial data is valid — it just needs to be categorised correctly. The UI shows it with a green "Settlement" badge.

**Why flag, not skip:** Skipping it would silently lose a real financial transaction. Importing it as a regular expense would incorrectly distribute it across all members. Marking `isSettlement: true` lets the balance calculation treat it appropriately and lets the user review it.

---

### Anomaly 6 — Duplicate Row (Row 21)

**What was found:**
Row 21 was identical to Row 2 — same description ("Groceries from D-Mart"), same date (2024-02-05), same amount (₹2400).

**Detection method:**
```js
const dupKey = `${description.toLowerCase()}|${date.toISOString().slice(0,10)}|${amount}`;
if (seen.has(dupKey)) { /* flag as duplicate */ }
else { seen.set(dupKey, rowNum); }
```

**Action taken:** Row 21 **skipped**. Row 2 (first occurrence) was already imported. Logged: `"Duplicate of row 2. First occurrence wins."`

**Why first-wins:** In a messy spreadsheet, the first entry is more likely to be the original. The second is more likely to be an accidental copy. The duplicate is logged so the user can verify and override if needed.

**Why the key includes date:** An earlier version (AI-generated) used only `${description}|${amount}`. This would incorrectly flag "Electricity - ₹2000" in February AND March as duplicates. Adding the date fixes this.

---

### Anomaly 7 — USD Currency (Row 4)

**What was found:**
Row 4 had amount `$12` — a USD amount in an INR-denominated group. This is Priya's complaint: "the sheet pretends a dollar is a rupee."

**Detection method:**
```js
if (String(rawAmount).includes('$')) return { currency: 'USD', rate: USD_TO_INR };
```

**Action taken:** Imported as `currency: USD`, `amount: 12`, `exchangeRate: 83.5`, `amountInr: 1002`. Logged as `severity: info`.

**Why info, not warning:** The conversion is deterministic and correct. It's useful to surface it so users know a conversion happened, but it's not a problem requiring human intervention.

---

### Anomaly 8 — Member After Departure Date (Row 24)

**What was found:**
Row 24 listed Meera in `split_with` for an expense dated April 10, 2024. Meera's `leftAt` is March 31, 2024.

**Detection method:**
```js
const known = KNOWN_MEMBERS[normalizeName(name)]; // { leftAt: new Date('2024-03-31') }
if (known?.leftAt && date > known.leftAt) {
  issues.push({ type: 'member_after_departure', ... });
}
```

**Action taken:** Imported with warning. Meera was **excluded from the active member split** because the `activeMembers` query filters by `joinedAt ≤ date ≤ leftAt`. The anomaly is logged so the user can review whether this expense should include Meera (e.g., if she still owed money for it).

---

### Anomaly 9 — Member Before Join Date (Row 25)

**What was found:**
Row 25 listed Sam in `split_with` for an expense dated March 1, 2024. Sam's `joinedAt` is April 15, 2024.

**Detection method:**
```js
if (known?.joinedAt && date < known.joinedAt) {
  issues.push({ type: 'member_before_join', ... });
}
```

**Action taken:** Imported with warning. Sam was **excluded from the active member split** for the same reason as above — the active member query would not return him for a March expense.

---

### Anomaly 10 — Unknown Split Type (Row 27)

**What was found:**
Row 27 had `split_type: "custom_split"` — not one of the valid values (`equal`, `exact`, `percentage`, `shares`, `unequal`).

**Detection method:**
```js
const validSplitTypes = ['equal', 'exact', 'percentage', 'shares', 'unequal'];
if (!validSplitTypes.includes(rawSplitType)) {
  issues.push({ type: 'unknown_split_type', severity: 'warning' });
}
```

**Action taken:** Imported with `split_type` defaulted to `equal`. Logged as warning.

**Why default to equal:** Equal split is the least surprising default. The user is informed via the anomaly log and can manually adjust the expense if needed.

---

### Summary Table

| # | Row | Anomaly Type | Severity | Action | Rows Affected |
|---|-----|-------------|----------|--------|---------------|
| 1 | 12 | missing_description | warning | Imported with fallback | 1 |
| 2 | 22 | invalid_date | error | **Skipped** | 1 |
| 3 | 23 | missing_payer | error | **Skipped** | 1 |
| 4 | 26 | negative_amount | warning | **Skipped** | 1 |
| 5 | 20 | settlement_as_expense | warning | Imported, isSettlement=true | 1 |
| 6 | 21 | duplicate | warning | **Skipped** (row 2 wins) | 1 |
| 7 | 4 | currency_usd | info | Imported, converted at ₹83.5 | 1 |
| 8 | 24 | member_after_departure | warning | Imported, Meera excluded from split | 1 |
| 9 | 25 | member_before_join | warning | Imported, Sam excluded from split | 1 |
| 10 | 27 | unknown_split_type | warning | Imported, defaulted to equal | 1 |

**Result: 22 of 26 rows imported. 4 rows skipped (2 errors + 1 duplicate + 1 negative). 10 anomalies logged.**

---

### Pre-Import Member Creation (Critical Fix)

A subtle bug existed in the initial implementation: when computing splits, the app queried active members from the database. If members from `split_with` hadn't been added to the group yet (because they hadn't appeared as payers in earlier rows), the first few expenses would be split among too few people.

**Fix:** Added a pre-pass before processing any rows:
```js
// Collect all unique names (payers + split_with members)
const allNames = new Set();
for (const row of rows) {
  const payer = getPaidBy(row);
  if (payer) allNames.add(payer);
  getMemberName(row).split(/[,;|]/).forEach(n => allNames.add(n.trim()));
}
// Create all memberships BEFORE processing rows
for (const name of allNames) { await getMembership(name); }
```

Without this, "Groceries from D-Mart" (row 1) would be split only among Aisha (the only member in the DB at that point) instead of all 5 active members.
