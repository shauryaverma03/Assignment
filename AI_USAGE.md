# AI_USAGE.md — AI Tool Usage Log

This document covers the AI tools used during development, the key prompts that shaped the architecture, and — most importantly — the concrete cases where AI produced wrong or incomplete output, how I caught it, and what I changed.

---

## Tools Used

| Tool | Role |
|------|------|
| **Claude (Anthropic)** | Primary development collaborator — architecture design, schema design, algorithm implementation, debugging, code review |
| **GitHub Copilot** | Inline completions for boilerplate (form handlers, CSS, repeated patterns) |

Claude was used via the chat interface for design discussions and code generation. Copilot was used as an inline tool while writing the code in VS Code. In cases of conflict between the two, human judgment was the tiebreaker.

---

## Key Prompts Used

### Prompt 1 — Schema Design
> "Design a relational schema for a shared expenses app where group members can join and leave at specific dates, expenses can be in multiple currencies, and every CSV import anomaly must be logged. The app needs to support: equal splits, exact-amount splits, percentage splits, and share-based splits. Balance calculations must account for members who left mid-way through the expense history."

**What I got:** A solid starting schema with User, Group, GroupMembership, Expense, ExpenseSplit, Settlement, and ImportLog tables. The `joinedAt`/`leftAt` pattern on GroupMembership was suggested here and was correct.

**What I changed:** AI initially didn't include `importRow` on Expense (for traceability back to the CSV row) or `rawData` on ImportLog (storing the original row verbatim). I added both because traceability was a core requirement.

---

### Prompt 2 — Balance Algorithm
> "Write a min-cash-flow algorithm in JavaScript that takes an object of {membershipId: netBalance} where positive means the member is owed money and negative means they owe money. Return the minimum set of transactions {from, to, amount} that settles all debts."

**What I got:** A working greedy implementation. Correct output.

**What I changed:** See Case 2 below — the AI's initial balance calculation (before the algorithm) had the settlement signs backwards. The algorithm itself was fine; the inputs to it were wrong.

---

### Prompt 3 — CSV Import Pipeline
> "Build an Express endpoint that accepts a CSV file upload via multer, parses it with csv-parser, and detects the following anomalies: missing description, invalid date, invalid amount, negative amount, missing payer, settlement-as-expense, duplicate rows (same description + date + amount), USD currency with conversion, member appearing after their departure date, member appearing before their join date, unknown split type. Log every anomaly to the database. Skip rows with errors; import rows with warnings."

**What I got:** A mostly complete import controller. The anomaly detection logic was correct for most cases.

**What I changed:** The duplicate detection key was wrong (see Case 1). The active member query was wrong (see Case 3). The member pre-creation logic was missing (see Case 5).

---

### Prompt 4 — React Dashboard with Charts
> "Build a React dashboard page that shows spending statistics across all groups. Include: stat cards for total spent/expenses/groups/members, a 6-month area chart for spending trend, a horizontal bar chart comparing groups by total spending, and group cards with sparklines. Use pure SVG with no external charting library. Use CSS variables for theming (dark/light mode compatible)."

**What I got:** A good structural scaffold. The SVG chart components needed refinement.

**What I changed:** The initial SVG viewBox calculations had off-by-one errors in the bar chart. The area chart gradient didn't use CSS variables correctly in Safari. Fixed both manually.

---

### Prompt 5 — Auth Middleware
> "Write Express middleware that accepts a JWT from either an Authorization Bearer header or an HttpOnly cookie, verifies it, and attaches the decoded user to req.user."

**What I got:** Correct implementation on first try. No changes needed.

---

## Cases Where AI Was Wrong

### Case 1 — Duplicate Detection Key (Missing the Date)

**What AI produced:**
```js
const dupKey = `${description}|${amount}`;
```

**Why it's wrong:**
This would incorrectly flag legitimate recurring expenses as duplicates. For example:
- Row 7: "March electricity — ₹2100" (March 10, 2024)
- Row 15: "May electricity — ₹2100" (May 12, 2024)

These have the same description prefix and same amount. With the AI's key, Row 15 would be incorrectly flagged as a duplicate of Row 7 and **skipped** — silently losing a valid expense.

More concretely in our CSV: "February internet bill" and "March internet bill" and "April internet bill" all cost ₹1200. The AI's key would import only the first and skip the rest.

**How I caught it:**
I tested the import with our full 26-row CSV and noticed that only the first electricity/internet bill was imported. Checked the anomaly logs — all subsequent ones were marked as duplicates. Immediately obvious something was wrong.

**What I changed:**
```js
const dupKey = `${description.toLowerCase()}|${date.toISOString().slice(0,10)}|${amount}`;
```

Added the date to the key. Now "electricity ₹2100" on March 10 and "electricity ₹2100" on May 12 are treated as different expenses. The same expense on the same day with the same amount is still correctly flagged as a duplicate.

---

### Case 2 — Balance Calculation: Settlement Signs Reversed

**What AI produced:**
```js
// When Rohan (paidBy) pays Aisha (paidTo) ₹500 as settlement:
net[settlement.paidById] -= amount;  // Rohan's balance goes more negative
net[settlement.paidToId] += amount;  // Aisha's balance goes more positive
```

**Why it's wrong:**
This is completely backwards. If Rohan owes Aisha ₹500 and pays her, Rohan's debt **decreases** (his negative balance improves, goes towards zero) and Aisha's credit **decreases** (she's been paid back, her positive balance goes towards zero).

The correct logic:
- Rohan paid → Rohan's balance goes **up** (less negative)
- Aisha received → Aisha's balance goes **down** (less positive)

So: `paidBy += amount`, `paidTo -= amount`.

The AI had both signs backwards.

**How I caught it:**
I tested with a simple 2-person scenario: Aisha paid ₹1000 for groceries, split equally (Rohan owes Aisha ₹500). Then recorded a settlement: Rohan pays Aisha ₹500. Expected result: both balances should be 0. Actual result with AI's code: Aisha's balance went from +₹500 to **+₹1000** (got doubled) and Rohan's from -₹500 to **-₹1000** (doubled in the wrong direction). The settlement made things worse, not better.

**What I changed:**
```js
// Correct:
if (net[s.paidById] !== undefined) net[s.paidById] += parseFloat(s.amount);
if (net[s.paidToId] !== undefined) net[s.paidToId] -= parseFloat(s.amount);
```

Verified by hand with a 3-person example after the fix.

---

### Case 3 — Active Member Query: `leftAt: null` Excludes Former Members

**What AI produced:**
```js
const activeMembers = await prisma.groupMembership.findMany({
  where: {
    groupId,
    joinedAt: { lte: date },
    leftAt: null,  // ← AI's version
  },
});
```

**Why it's wrong:**
`leftAt: null` means "members who have NEVER left." This excludes Meera from all expenses — even February and March ones where she was absolutely an active member.

The condition we need is: "members who had joined by this date AND (haven't left yet OR left after this date)."

**How I caught it:**
After importing the CSV, I checked Meera's balance. Expected: she should owe money for February and March expenses. Actual: her balance was ₹0 — she appeared in zero splits. Checked the database — her splits table was empty despite being in the group. The bug was in the `activeMembers` query.

**What I changed:**
```js
const activeMembers = await prisma.groupMembership.findMany({
  where: {
    groupId,
    joinedAt: { lte: date },
    OR: [
      { leftAt: null },           // still active
      { leftAt: { gte: date } },  // left on or after this expense date
    ],
  },
});
```

Now Meera is correctly included for February and March expenses (leftAt March 31 ≥ those dates) and correctly excluded for April expenses (leftAt March 31 < April dates).

---

### Case 4 — SVG Chart: Off-by-One Bar Rendering

**What AI produced:**
```jsx
// For a bar chart with N bars across width W:
const barWidth = W / data.length;
// Bars rendered at:
x = i * barWidth  // no padding between bars
```

**Why it's wrong:**
With no padding, adjacent bars touch each other with no gap. At small sizes (the sparklines on group cards are only 80px wide), the bars merge into a solid block and are indistinguishable.

Additionally, if the last bar extended to exactly `W`, it would sometimes clip or overflow the SVG viewBox.

**How I caught it:**
Looked at the rendered UI — the 6-bar sparkline on group cards looked like a rectangle, not individual bars.

**What I changed:**
```jsx
const bw = W / data.length - 2;  // subtract 2px for gap
const x = i * (W / data.length) + 1;  // offset by 1px for left edge
```

Each bar is 2px narrower than its slot, leaving a 1px gap on each side. Small but visually clear.

---

### Case 5 — CSV Import: Members Not Pre-Created Before Split Computation

**What the initial AI code did:**
The import processed rows sequentially. For each row, it called `getMembership(paidBy)` to create/find the payer, then queried `activeMembers` from the database to compute splits.

**Why it's wrong:**
`activeMembers` only returns members who are **already in the database**. If row 1 is paid by Aisha and row 2 is paid by Rohan, then when processing row 1:
- `getMembership("Aisha")` creates Aisha in the DB
- `activeMembers` query returns only Aisha (Rohan, Priya, Meera, Dev don't exist yet)
- Row 1 gets split: Aisha 100%, ₹2400 each — **WRONG**

Row 1 should be split 5 ways (₹480 each). But only Aisha is in the DB when row 1 is processed.

**How I caught it:**
After importing, I checked the splits for "Groceries from D-Mart" (row 1). Expected 5 splits of ₹480. Actual: 1 split of ₹2400 (Aisha only). Checked row 2: 2 splits (Aisha + Rohan, ₹1200 each — also wrong). The bug was clear: the number of splits increased with each row as more payers were encountered.

**What I changed:**
Added a pre-pass that runs before processing any rows:
```js
// Collect ALL unique member names (payers AND split_with members)
const allNames = new Set();
for (const row of rows) {
  const payer = getPaidBy(row);
  if (payer) allNames.add(payer);
  const rawMembers = getMemberName(row);
  if (rawMembers) {
    rawMembers.split(/[,;|]/).map(s => s.trim()).filter(Boolean)
      .forEach(n => allNames.add(n));
  }
}
// Create ALL memberships BEFORE processing any expense rows
for (const name of allNames) { await getMembership(name); }
```

After this fix, row 1 correctly produces 5 splits of ₹480. Verified: all 22 imported rows now have the correct number of splits.

---

## Summary

| Case | What AI Got Wrong | How I Caught It | Severity |
|------|------------------|-----------------|----------|
| 1 | Duplicate key missing date | Recurring expenses wrongly flagged as duplicates in test | High — silent data loss |
| 2 | Settlement signs reversed | Manual 2-person balance test gave wrong result | Critical — incorrect balances |
| 3 | `leftAt: null` excludes former members | Meera had ₹0 balance despite being in 9 expenses | Critical — incorrect splits |
| 4 | SVG bar chart no padding | Visual inspection — bars merged into solid block | Low — cosmetic |
| 5 | Members not pre-created before splits | Row 1 had 1 split instead of 5 | Critical — incorrect splits |

**Key learning:** AI is excellent at generating structural code quickly. It is unreliable at domain-specific correctness — especially in financial calculations where a sign flip or a missing date can silently corrupt data. Every financial calculation in this project was verified by hand with a worked example before being trusted.
