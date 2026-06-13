# AI_USAGE.md — AI Tool Usage Log

## Tools Used
- **Claude (Anthropic)** — primary development collaborator for scaffolding, code generation, and debugging
- **GitHub Copilot** — inline completions during development

---

## Key Prompts Used

1. "Design a relational schema for a shared expenses app where group members can join and leave at specific dates, expenses can be in multiple currencies, and every CSV import anomaly must be logged."

2. "Write a min-cash-flow algorithm in JavaScript that takes a map of {memberId: netBalance} and returns the minimum set of transactions to settle all debts."

3. "Build a CSV import pipeline in Express that detects: missing fields, invalid dates, duplicate rows, negative amounts, settlements logged as expenses, USD amounts, and members appearing in expenses after they left the group."

---

## Cases Where AI Was Wrong

### Case 1: Duplicate Detection Key
**What AI produced:** `${description}|${amount}` as the duplicate key
**Problem:** Two different expenses on different dates could have the same description and amount (e.g., "Electricity - ₹2000" in Feb and March). The AI's key would incorrectly flag them as duplicates.
**Fix:** Changed key to `${description.toLowerCase()}|${date.toISOString().slice(0,10)}|${amount}` — includes the date.

### Case 2: Balance Calculation — Settlement Direction
**What AI produced:** `net[settlement.paidById] -= amount` and `net[settlement.paidToId] += amount`
**Problem:** This is backwards. If A pays B ₹500 as a settlement, A's debt decreases (their negative balance improves) and B's credit decreases. The correct direction: `paidBy += amount`, `paidTo -= amount`.
**Fix:** Swapped the signs. Verified by hand with a 3-person example.

### Case 3: Active Member Query for Split
**What AI produced:** `leftAt: null` in the Prisma `where` clause to find active members
**Problem:** This excluded Meera on dates when she was still active (before March 31). `leftAt: null` only finds members who never left, not members who hadn't left yet on a given date.
**Fix:** Changed to `OR: [{ leftAt: null }, { leftAt: { gte: date } }]` so members who left after the expense date are still included in the split.
