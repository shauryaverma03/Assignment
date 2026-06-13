# SCOPE.md — Anomaly Log & Database Schema

## Database Schema

### Users
Stores login credentials. Email + username must be unique.

### Groups
Named expense-sharing group. Belongs to a creator (User).

### GroupMembership
Junction table with `joinedAt` + `leftAt` dates. This is how we model members joining/leaving over time. A member is "active on date X" if `joinedAt <= X` and (`leftAt is NULL` OR `leftAt >= X`).

### Expenses
Stores the expense amount in both original currency and INR. `exchangeRate` is the USD→INR rate at time of import. `importRow` tracks which CSV row it came from for traceability.

### ExpenseSplit
One row per (expense, member). Stores `amountInr`, and optionally `percentage` or `shares` for non-equal splits.

### Settlement
A direct payment between two members. Adjusts net balances but is not an expense.

### ImportLog
Every anomaly detected during CSV import is logged here with severity (error/warning/info), status (pending/approved/rejected/auto_handled), and the action taken.

---

## CSV Anomalies Detected (12+ categories)

| # | Anomaly Type | Detection | Policy |
|---|---|---|---|
| 1 | Missing description | Empty `description` field | Import with warning, use "Imported expense" as fallback |
| 2 | Invalid/unparseable date | Regex + Date parse fail | **Skip row** — date is required for membership validation |
| 3 | Invalid/missing amount | NaN after stripping currency symbols | **Skip row** — cannot compute splits without amount |
| 4 | Negative amount | amount < 0 | **Skip row** — treated as refund, flagged for user review |
| 5 | Settlement logged as expense | Description contains "settlement", "settle up", "paid back" | Flag as settlement, mark `isSettlement: true` on import |
| 6 | Missing payer | Empty `paid_by` field | **Skip row** — balance calculation requires a payer |
| 7 | Member after departure date | Expense date > member's `leftAt` | Flag warning; Meera's expenses after March 31 are flagged |
| 8 | Member before join date | Expense date < member's `joinedAt` | Flag warning; Sam's expenses before April 15 are flagged |
| 9 | Duplicate rows | Same description + date + amount seen twice | **Skip second occurrence** — first row wins, flagged with original row # |
| 10 | USD currency | `$` symbol detected in amount | Convert at 1 USD = ₹83.5, log as info |
| 11 | Unknown split type | Value not in [equal, exact, percentage, shares, unequal] | Default to `equal`, log warning |
| 12 | Import error (row-level) | Any unhandled exception during row processing | Log error, skip row, continue import |

All anomalies are surfaced in the Import Report visible in the UI. Users can review and resolve each one (approve/reject).
