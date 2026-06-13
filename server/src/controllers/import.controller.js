const prisma = require('../utils/prisma');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const USD_TO_INR = parseFloat(process.env.USD_TO_INR) || 83.5;

// Normalize member name to a standard form
const normalizeName = (name) => name?.trim().toLowerCase();

// Known members from context
const KNOWN_MEMBERS = {
  aisha: { joinedAt: new Date('2024-02-01'), leftAt: null },
  rohan: { joinedAt: new Date('2024-02-01'), leftAt: null },
  priya: { joinedAt: new Date('2024-02-01'), leftAt: null },
  meera: { joinedAt: new Date('2024-02-01'), leftAt: new Date('2024-03-31') },
  dev:   { joinedAt: new Date('2024-02-01'), leftAt: null },
  sam:   { joinedAt: new Date('2024-04-15'), leftAt: null },
};

const parseAmount = (val) => {
  if (!val) return null;
  const cleaned = String(val).replace(/[₹$,\s]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
};

const parseDate = (val) => {
  if (!val) return null;
  const cleaned = String(val).trim();
  // Try multiple formats
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/,             // YYYY-MM-DD
    /^(\d{2})\/(\d{2})\/(\d{4})$/,             // DD/MM/YYYY
    /^(\d{2})-(\d{2})-(\d{4})$/,               // DD-MM-YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,         // M/D/YYYY
  ];
  for (const fmt of formats) {
    const m = cleaned.match(fmt);
    if (m) {
      let d;
      if (fmt === formats[0]) d = new Date(`${m[1]}-${m[2]}-${m[3]}`);
      else if (fmt === formats[1] || fmt === formats[2]) d = new Date(`${m[3]}-${m[2]}-${m[1]}`);
      else d = new Date(`${m[3]}-${String(m[1]).padStart(2,'0')}-${String(m[2]).padStart(2,'0')}`);
      if (!isNaN(d.getTime())) return d;
    }
  }
  // fallback
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : d;
};

const detectCurrency = (raw) => {
  if (!raw) return { currency: 'INR', rate: 1 };
  const s = String(raw);
  if (s.includes('$')) return { currency: 'USD', rate: USD_TO_INR };
  if (s.includes('₹') || s.includes('Rs')) return { currency: 'INR', rate: 1 };
  return { currency: 'INR', rate: 1 };
};

const importCSV = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const groupId = parseInt(req.body.groupId);
  if (!groupId) return res.status(400).json({ error: 'groupId required' });

  const rows = [];
  const anomalies = [];
  const imported = [];

  // Parse CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  // Get or create memberships
  const membershipCache = {}; // displayName -> GroupMembership

  const getMembership = async (name) => {
    const key = normalizeName(name);
    if (membershipCache[key]) return membershipCache[key];

    // Look up existing membership by displayName
    let m = await prisma.groupMembership.findFirst({
      where: { groupId, displayName: { equals: name, mode: 'insensitive' } },
    });

    if (!m) {
      // Create a placeholder user and membership
      let user = await prisma.user.findFirst({ where: { username: { equals: key } } });
      if (!user) {
        const bcrypt = require('bcryptjs');
        user = await prisma.user.create({
          data: { email: `${key}@import.local`, username: key, password: await bcrypt.hash('import123', 10) },
        });
      }
      const known = KNOWN_MEMBERS[key] || { joinedAt: new Date('2024-02-01'), leftAt: null };
      m = await prisma.groupMembership.create({
        data: { groupId, userId: user.id, displayName: name, joinedAt: known.joinedAt, leftAt: known.leftAt },
      });
    }

    membershipCache[key] = m;
    return m;
  };

  // Track seen expenses for duplicate detection
  const seen = new Map(); // key: description+date+amount -> row index

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-indexed, row 1 is header
    const issues = [];

    // --- Anomaly Detection ---

    // 1. Missing description
    const description = (row.description || row.Description || row.expense || row.Expense || '').trim();
    if (!description) issues.push({ type: 'missing_description', desc: 'No description provided', severity: 'warning' });

    // 2. Missing or unparseable date
    const rawDate = row.date || row.Date || row.DATE || '';
    const date = parseDate(rawDate);
    if (!date) issues.push({ type: 'invalid_date', desc: `Cannot parse date: "${rawDate}"`, severity: 'error' });

    // 3. Missing or invalid amount
    const rawAmount = row.amount || row.Amount || row.AMOUNT || '';
    const rawAmountStr = String(rawAmount);
    const { currency, rate } = detectCurrency(rawAmountStr);
    const amount = parseAmount(rawAmountStr);
    if (amount === null) {
      issues.push({ type: 'invalid_amount', desc: `Cannot parse amount: "${rawAmount}"`, severity: 'error' });
    }

    // 4. Negative amount
    if (amount !== null && amount < 0) {
      issues.push({ type: 'negative_amount', desc: `Negative amount ${amount} — treated as refund (skipped)`, severity: 'warning' });
    }

    // 5. Settlement logged as expense
    const desc_lower = description.toLowerCase();
    const isSettlement = desc_lower.includes('settlement') || desc_lower.includes('settle up') || desc_lower.includes('paid back');
    if (isSettlement) {
      issues.push({ type: 'settlement_as_expense', desc: 'This looks like a settlement, not an expense', severity: 'warning' });
    }

    // 6. Missing payer
    const rawPaidBy = row.paid_by || row.paidBy || row.PaidBy || row['Paid By'] || '';
    if (!rawPaidBy.trim()) issues.push({ type: 'missing_payer', desc: 'No payer specified', severity: 'error' });

    // 7. Members who left still in expense
    if (date) {
      const memberFields = ['split_with', 'members', 'participants', 'Members'];
      let rawMembers = '';
      for (const f of memberFields) if (row[f]) { rawMembers = row[f]; break; }
      const memberNames = rawMembers ? rawMembers.split(/[,;|]/).map(s => s.trim()).filter(Boolean) : [];
      
      for (const name of memberNames) {
        const key = normalizeName(name);
        const known = KNOWN_MEMBERS[key];
        if (known?.leftAt && date > known.leftAt) {
          issues.push({ type: 'member_after_departure', desc: `${name} left on ${known.leftAt.toDateString()} but expense is dated ${date.toDateString()}`, severity: 'warning' });
        }
        if (known?.joinedAt && date < known.joinedAt) {
          issues.push({ type: 'member_before_join', desc: `${name} joined on ${known.joinedAt.toDateString()} but expense is dated ${date.toDateString()}`, severity: 'warning' });
        }
      }
    }

    // 8. Duplicate detection
    if (description && date && amount) {
      const dupKey = `${description.toLowerCase()}|${date.toISOString().slice(0,10)}|${amount}`;
      if (seen.has(dupKey)) {
        issues.push({ type: 'duplicate', desc: `Duplicate of row ${seen.get(dupKey)}. First occurrence wins.`, severity: 'warning' });
      } else {
        seen.set(dupKey, rowNum);
      }
    }

    // 9. Currency mismatch (USD in INR context)
    if (currency === 'USD') {
      issues.push({ type: 'currency_usd', desc: `Amount in USD — converting at rate 1 USD = ₹${USD_TO_INR}`, severity: 'info' });
    }

    // 10. Split type detection
    const rawSplitType = (row.split_type || row.splitType || row['Split Type'] || 'equal').trim().toLowerCase();
    const validSplitTypes = ['equal', 'exact', 'percentage', 'shares', 'unequal'];
    if (rawSplitType && !validSplitTypes.includes(rawSplitType)) {
      issues.push({ type: 'unknown_split_type', desc: `Unknown split type "${rawSplitType}" — defaulting to equal`, severity: 'warning' });
    }

    // Log all anomalies
    const hasError = issues.some(x => x.severity === 'error');
    const isDuplicate = issues.some(x => x.type === 'duplicate');
    const isNegative = issues.some(x => x.type === 'negative_amount');

    for (const issue of issues) {
      const log = await prisma.importLog.create({
        data: {
          groupId,
          rowNumber: rowNum,
          rawData: row,
          issueType: issue.type,
          issueDescription: issue.desc,
          severity: issue.severity,
          status: hasError || isDuplicate || isNegative ? 'rejected' : 'auto_handled',
          actionTaken: hasError ? 'Row skipped due to error' : isDuplicate ? 'Duplicate row skipped' : isNegative ? 'Negative amount skipped' : 'Imported with note',
        },
      });
      anomalies.push(log);
    }

    // Skip rows with errors, duplicates, or negative amounts
    if (hasError || isDuplicate || isNegative) continue;

    // Import the expense
    try {
      const paidByMembership = await getMembership(rawPaidBy.trim());
      const amountInr = amount * rate;

      // Get active members on this date for equal split
      const activeMembers = await prisma.groupMembership.findMany({
        where: {
          groupId,
          joinedAt: { lte: date },
          OR: [{ leftAt: null }, { leftAt: { gte: date } }],
        },
      });

      const splitType = validSplitTypes.includes(rawSplitType) ? rawSplitType : 'equal';
      const perPerson = amountInr / activeMembers.length;

      const expense = await prisma.expense.create({
        data: {
          groupId,
          description: description || 'Imported expense',
          amount,
          currency,
          exchangeRate: rate,
          amountInr,
          splitType,
          date,
          paidById: paidByMembership.id,
          isSettlement,
          notes: issues.map(x => x.desc).join('; '),
          importRow: rowNum,
          splits: {
            create: activeMembers.map((m, idx) => ({
              memberId: m.id,
              amountInr: idx === activeMembers.length - 1
                ? Math.round((amountInr - perPerson * (activeMembers.length - 1)) * 100) / 100
                : Math.round(perPerson * 100) / 100,
            })),
          },
        },
      });
      imported.push(expense);
    } catch (err) {
      anomalies.push({ rowNumber: rowNum, issueType: 'import_error', issueDescription: err.message });
    }
  }

  fs.unlinkSync(req.file.path);

  res.json({
    totalRows: rows.length,
    imported: imported.length,
    skipped: rows.length - imported.length,
    anomalies: anomalies.length,
    report: anomalies,
  });
};

const getImportLogs = async (req, res) => {
  try {
    const { groupId } = req.params;
    const logs = await prisma.importLog.findMany({
      where: { groupId: parseInt(groupId) },
      orderBy: { rowNumber: 'asc' },
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const resolveLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actionTaken } = req.body;
    const log = await prisma.importLog.update({
      where: { id: parseInt(id) },
      data: { status, actionTaken, resolvedById: req.user.id, resolvedAt: new Date() },
    });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { importCSV, getImportLogs, resolveLog };
