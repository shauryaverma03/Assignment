# DECISIONS.md — Engineering Decision Log

Every significant design or implementation decision made during this project, with the options considered and the reasoning behind the choice.

---

## Decision 1: Backend Language — Node.js + Express over Django

**Context:** The assignment mentioned Django as a plus.

**Options considered:**
| Option | Pros | Cons |
|--------|------|------|
| Django REST Framework | Assignment mentions it; built-in admin | Less fluent in Python; DRF's serialiser boilerplate is slow to write correctly |
| Node.js + Express | Fast to build; same language as frontend; Prisma ecosystem is excellent | Not the "plus" language |

**Decision:** Node.js + Express.

**Reasoning:** The assignment says Django is "a plus", not a requirement. A clean, working Node.js implementation demonstrates better engineering than a half-working Django one. More importantly: I can confidently defend every line of this Node.js code in an interview. I cannot do that for Django code I wrote under time pressure.

**Trade-off accepted:** Miss the Django bonus point. Gain: a complete, debuggable, deployable application.

---

## Decision 2: ORM — Prisma over Sequelize or raw SQL

**Options considered:**
| Option | Pros | Cons |
|--------|------|------|
| Prisma | Type-safe; `schema.prisma` is readable by anyone; built-in migrations | Slightly more setup |
| Sequelize | Popular; well-documented | Config-heavy; model definitions are verbose |
| Raw SQL (pg) | Maximum control; no abstraction layer | No migrations; schema not self-documenting |

**Decision:** Prisma.

**Reasoning:** `schema.prisma` is a single file that tells any reader — including an interviewer — the complete data model in under 2 minutes. Prisma's `findMany` with `include` and `where` is expressive enough to write all our queries without raw SQL, and type-safe enough to catch mistakes at compile time. The migration history (`prisma db push`) also shows deliberate schema evolution.

---

## Decision 3: Membership Model — Date Ranges over Boolean Flags

**Context:** Meera left March 31. Sam joined April 15. How do we track this?

**Options considered:**
| Option | How it works | Problem |
|--------|-------------|---------|
| `isActive: Boolean` | One flag per membership | Cannot answer "was Sam active on March 1?" — only "is Sam active now?" |
| `joinedAt + leftAt` dates | Date range per membership | Can answer "was Sam active on any given date?" |
| Soft delete | Mark membership as deleted | Same problem as boolean flag |

**Decision:** `joinedAt` + `leftAt` date range on `GroupMembership`.

**Reasoning:** The core problem is time-scoped membership. A boolean cannot express "active from date A to date B." The date range model lets us write a single, correct query:

```sql
WHERE joinedAt <= :expenseDate
  AND (leftAt IS NULL OR leftAt >= :expenseDate)
```

This correctly handles:
- Meera included in February expenses (leftAt = March 31 > February dates)
- Meera excluded from April expenses (leftAt = March 31 < April dates)
- Sam excluded from March expenses (joinedAt = April 15 > March dates)
- Sam included in May expenses (joinedAt = April 15 < May dates)

**Trade-off accepted:** Slightly more complex query. Gain: correct results for all historical dates.

---

## Decision 4: Currency — Store Both Original and INR

**Context:** Some expenses are in USD. Priya's complaint was that "$12" was being read as "₹12."

**Options considered:**
| Option | Description | Problem |
|--------|-------------|---------|
| Store original only | Keep `$12`, convert at query time | Every balance calculation needs a currency conversion; exchange rate can drift |
| Store INR only | Convert `$12 → ₹1002` at import | Lose original value; can't show "$12 (≈ ₹1002)" to the user |
| Store both | `amount=12, currency=USD, exchangeRate=83.5, amountInr=1002` | Slightly more storage |

**Decision:** Store both `amount`/`currency`/`exchangeRate` AND `amountInr`.

**Reasoning:**
- **Audit trail:** Storing the original `$12` lets the user see exactly what was imported, and verify the conversion.
- **Simple math:** All balance calculations use `amountInr` only — no currency logic in the balance controller.
- **Rate preservation:** Storing `exchangeRate` per expense means the rate is "locked in" at import time. Future rate changes don't retroactively alter old balances.

---

## Decision 5: Duplicate Detection — Include Date in Key

**Context:** The CSV had a duplicate row — same description and amount appearing twice.

**Options considered:**
| Duplicate key | Problem |
|--------------|---------|
| `description + amount` | "Electricity — ₹2000" in February and March would be falsely flagged as duplicates |
| `description + date + amount` | Correctly identifies true duplicates (same expense, same day, same amount) |
| Hash of full row | Too strict — any field difference (whitespace, typo) would miss a real duplicate |

**Decision:** `${description.toLowerCase()}|${date.toISOString().slice(0,10)}|${amount}`

**Reasoning:** The three-field key balances sensitivity and specificity. It correctly identifies true duplicates while allowing the same expense type to recur on different days. Lowercasing the description prevents case-sensitivity mismatches.

**Policy: First row wins.** In a messy spreadsheet, the first entry is more likely the original. The duplicate is logged (not silently dropped) so the user can verify.

---

## Decision 6: Negative Amounts — Skip and Flag, Not Auto-Convert to Settlement

**Context:** Row 26 had amount `-₹200`.

**Options considered:**
| Option | Risk |
|--------|------|
| Import as negative expense | Corrupts balances in unpredictable ways |
| Auto-convert to settlement | Assumes intent; could be wrong (might be a data entry error) |
| Skip and flag for review | User decides what it means |

**Decision:** Skip and flag.

**Reasoning:** A negative amount is ambiguous. It could be a refund, a sign-convention error, or a data entry mistake. Auto-converting it to a settlement would silently make assumptions about intent. Skipping it with a clear log entry lets the user make an informed decision. The `ImportLog` row has `status: pending` — the user can approve it as a settlement or dismiss it.

---

## Decision 7: Balance Algorithm — Min-Cash-Flow

**Context:** With 6 members and many expenses, the naive approach creates O(n²) pairwise IOUs.

**Options considered:**
| Algorithm | Result for 5 people in debt |
|-----------|----------------------------|
| Pairwise IOUs | Up to 15 transactions ("A owes B, B owes C, A owes C...") |
| Min-cash-flow (greedy) | Minimum possible transactions (3–5) |

**Decision:** Min-cash-flow greedy simplification.

**Algorithm:**
1. Compute net balance for each member (positive = owed money, negative = owes money).
2. Repeatedly: pick the largest creditor and largest debtor. The debtor pays the creditor `min(|debtor_balance|, creditor_balance)`.
3. Repeat until all balances are zero.

**Example result for Flat 4B:**
Instead of each member having individual IOUs to each other, the algorithm produces:
- Rohan → Aisha: ₹302.90
- Priya → Aisha: ₹950.90
- Meera → Aisha: ₹1043.30
- Dev → Aisha: ₹106.80
- (Sam is settled)

5 payments instead of potentially 15. Exactly what Aisha asked for: "one number per person, who pays whom, done."

---

## Decision 8: Import — Log Everything, Silent Skip Nothing

**Context:** The assignment explicitly says "a crashed import and a silent guess are both failing answers."

**Options considered:**
| Approach | Problem |
|----------|---------|
| Crash on first error | Loses all valid data after the bad row |
| Silent skip | User doesn't know what happened to their data |
| Log all anomalies + continue | Complete audit trail; user sees every decision |

**Decision:** Log every anomaly to `ImportLog`, continue processing remaining rows.

**Implementation:**
- Each anomaly gets its own `ImportLog` row with `rawData` (the full CSV row), `issueType`, `severity`, `status`, and `actionTaken`.
- The import returns a summary: `{totalRows, imported, skipped, anomalies}`.
- The UI shows the full log with color-coded severity (error/warning/info) and status badges.
- Users can resolve pending anomalies (mark as approved/rejected) after review.

**Benefit:** Every decision is traceable. If a user asks "why wasn't row 23 imported?", the answer is in `ImportLog` with the exact reason and the raw data that caused it.

---

## Decision 9: Auth — JWT Bearer Token + HttpOnly Cookie (Dual Mode)

**Context:** The frontend uses Axios with a Bearer token. But we also want cookie-based auth for future server-side rendering.

**Options considered:**
| Option | Problem |
|--------|---------|
| Bearer token only | Can't use cookie-based SSR in future |
| HttpOnly cookie only | Doesn't work well with Axios/mobile clients |
| Both | Slight complexity in middleware |

**Decision:** Issue both. Auth middleware accepts either:
```js
const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
```

**Benefit:** Browser clients get XSS-resistant HttpOnly cookies. API clients (Postman, mobile) can use Bearer tokens. Both are covered by the same middleware.

---

## Decision 10: Frontend Charts — Pure SVG, No Library

**Context:** The dashboard and group detail pages needed spending charts, balance visualisations, and donut charts.

**Options considered:**
| Option | Bundle size cost | Control |
|--------|-----------------|---------|
| Recharts | +200KB | Limited customisation |
| Chart.js | +180KB | Canvas-based, harder to style |
| D3.js | +90KB | Powerful but complex API |
| Pure SVG (hand-rolled) | 0KB | Full control, matches existing design system |

**Decision:** Pure SVG components written inline in JSX.

**Reasoning:** The charts needed to match the existing CSS variable-based design system (dark/light mode, accent colours). Library charts are hard to theme this precisely. The charts we need (bar, area line, donut, horizontal bar) are simple enough to implement in ~100 lines of SVG each. Zero additional dependencies. Bundle stayed at 373KB gzipped.
