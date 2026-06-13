const prisma = require('../utils/prisma');
const { Decimal } = require('@prisma/client/runtime/library');

const computeSplits = (members, amount, splitType, customSplits) => {
  const splits = [];

  if (splitType === 'equal') {
    if (!members.length) return splits;
    const share = amount / members.length;
    members.forEach(m => splits.push({ memberId: m.id, amountInr: Math.round(share * 100) / 100 }));
    // fix rounding on last person
    const total = splits.reduce((s, x) => s + x.amountInr, 0);
    splits[splits.length - 1].amountInr += Math.round((amount - total) * 100) / 100;

  } else if (splitType === 'exact') {
    customSplits.forEach(s => splits.push({ memberId: s.memberId, amountInr: parseFloat(s.amount) }));

  } else if (splitType === 'percentage') {
    customSplits.forEach(s => {
      splits.push({ memberId: s.memberId, amountInr: Math.round(amount * s.percentage / 100 * 100) / 100, percentage: s.percentage });
    });

  } else if (splitType === 'shares') {
    const totalShares = customSplits.reduce((s, x) => s + x.shares, 0);
    customSplits.forEach(s => {
      splits.push({ memberId: s.memberId, amountInr: Math.round(amount * s.shares / totalShares * 100) / 100, shares: s.shares });
    });
  }

  return splits;
};

const createExpense = async (req, res) => {
  try {
    const { groupId, description, amount, currency, exchangeRate, splitType, date, paidById, customSplits, notes } = req.body;
    const rate = parseFloat(exchangeRate) || 1;
    const amountInr = parseFloat(amount) * rate;

    // Day-bounded window so a member who joined at any time on the expense date counts as active.
    const startOfDay = new Date(date); startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date); endOfDay.setUTCHours(23, 59, 59, 999);

    // get active members on expense date
    let members = await prisma.groupMembership.findMany({
      where: {
        groupId: parseInt(groupId),
        joinedAt: { lte: endOfDay },
        OR: [{ leftAt: null }, { leftAt: { gte: startOfDay } }],
      },
    });

    // Fallback: if the expense predates everyone's join date, split across all current members
    // so the expense still records instead of crashing.
    if (!members.length) {
      members = await prisma.groupMembership.findMany({
        where: { groupId: parseInt(groupId), leftAt: null },
      });
    }

    if (!members.length) {
      return res.status(400).json({ error: 'This group has no members to split the expense between.' });
    }

    const splits = computeSplits(members, amountInr, splitType, customSplits || []);

    const expense = await prisma.expense.create({
      data: {
        groupId: parseInt(groupId),
        description,
        amount: parseFloat(amount),
        currency: currency || 'INR',
        exchangeRate: rate,
        amountInr,
        splitType: splitType || 'equal',
        date: new Date(date),
        paidById: parseInt(paidById),
        createdById: req.user.id,
        notes: notes || '',
        splits: {
          create: splits,
        },
      },
      include: { splits: { include: { member: true } }, paidBy: true },
    });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const { groupId } = req.query;
    const where = groupId ? { groupId: parseInt(groupId) } : {};
    const expenses = await prisma.expense.findMany({
      where,
      include: { splits: { include: { member: { include: { user: true } } } }, paidBy: { include: { user: true } } },
      orderBy: { date: 'desc' },
    });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getExpense = async (req, res) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { splits: { include: { member: { include: { user: true } } } }, paidBy: { include: { user: true } } },
    });
    if (!expense) return res.status(404).json({ error: 'Not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createExpense, getExpenses, getExpense, deleteExpense };
