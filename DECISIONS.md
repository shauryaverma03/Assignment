# DECISIONS.md — Engineering Decision Log

## 1. Stack Choice: Node.js + Express over Django
**Options:** Django REST Framework / Node.js + Express
**Decision:** Node.js + Express
**Why:** The assignment says Django is "a plus", not a requirement. Confidence in a stack you know well is more important than an exotic choice you can't explain in a live session. Node.js with Express is fast to build with, well understood for REST APIs, and the ecosystem (Prisma, JWT, multer) covers all requirements cleanly.

## 2. ORM: Prisma over Sequelize
**Options:** Prisma / Sequelize / raw SQL
**Decision:** Prisma
**Why:** Prisma's `schema.prisma` gives a single source of truth for the schema — readable by any interviewer in 30 seconds. Type-safe queries reduce runtime bugs. Migration history is built-in and shows deliberate schema evolution (good for the commit history requirement). Sequelize's config-heavy setup would slow development.

## 3. Time-scoped Membership Model
**Options:** Boolean `active` flag / `joinedAt` + `leftAt` dates
**Decision:** `joinedAt` + `leftAt` date range on `GroupMembership`
**Why:** Sam moved in mid-April; Meera moved out end of March. A boolean flag cannot represent this. Date ranges let us ask "who was active on March 15th?" and correctly compute splits for any historical expense. This is the correct data model for the problem.

## 4. Currency Handling: Convert at Import
**Options:** Store original currency only / store both original + INR
**Decision:** Store both `amount`/`currency` and `amountInr` with `exchangeRate`
**Why:** Priya's complaint — "the sheet pretends a dollar is a rupee" — means the app must convert. Storing the original amount preserves the audit trail. Storing `amountInr` makes balance computation simple and consistent. The exchange rate is stored per-expense so historical rates are preserved.

## 5. Duplicate Detection: First Row Wins
**Options:** Last row wins / prompt user / first row wins
**Decision:** First row wins
**Why:** In a spreadsheet that's "a mess", the first entry of a duplicate is more likely to be the original. We log the duplicate so Meera can review and override. Silent deduplication (picking either without logging) would fail the "detect + surface" requirement.

## 6. Negative Amounts: Treat as Refund, Skip
**Options:** Treat as negative expense / treat as settlement / skip
**Decision:** Skip import, flag for user review
**Why:** A negative amount could mean a refund, a data error, or an inverted sign convention. Importing it silently as an expense would corrupt balances. We surface it so the user can manually decide whether to log it as a settlement.

## 7. Balance Algorithm: Min-Cash-Flow
**Options:** Pairwise IOUs / Min-cash-flow simplification
**Decision:** Min-cash-flow (greedy simplification)
**Why:** Aisha asked for "one number per person, who pays whom, done." Min-cash-flow minimizes the number of transactions in the settlement plan. For N people with complex splits, this is dramatically cleaner than pairwise IOUs.

## 8. Import Anomaly Review: Log + Status
**Options:** Crash on error / silent skip / log all + expose to user
**Decision:** Log all anomalies with severity + status; expose in UI
**Why:** The assignment explicitly says "a crashed import and a silent guess are both failing answers." Every anomaly gets an `ImportLog` row with the raw data, issue type, and action taken. Users can see every decision the importer made and resolve pending items.
