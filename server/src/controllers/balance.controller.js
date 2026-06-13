const prisma = require('../utils/prisma');
const { simplifyDebts } = require('../utils/balance');

const getGroupBalances = async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);

    const memberships = await prisma.groupMembership.findMany({
      where: { groupId },
      include: { user: { select: { id: true, username: true } } },
    });

    const expenses = await prisma.expense.findMany({
      where: { groupId, isSettlement: false },
      include: { splits: true },
    });

    const settlements = await prisma.settlement.findMany({ where: { groupId } });

    // net[memberId] = amount member is owed (positive) or owes (negative)
    const net = {};
    memberships.forEach(m => (net[m.id] = 0));

    expenses.forEach(exp => {
      // payer gets credit
      if (net[exp.paidById] !== undefined) net[exp.paidById] += parseFloat(exp.amountInr);
      // each split member owes their share
      exp.splits.forEach(split => {
        if (net[split.memberId] !== undefined) net[split.memberId] -= parseFloat(split.amountInr);
      });
    });

    // settlements adjust balances
    settlements.forEach(s => {
      if (net[s.paidById] !== undefined) net[s.paidById] += parseFloat(s.amount);
      if (net[s.paidToId] !== undefined) net[s.paidToId] -= parseFloat(s.amount);
    });

    const memberMap = {};
    memberships.forEach(m => {
      memberMap[m.id] = { id: m.id, displayName: m.displayName || m.user.username, userId: m.userId };
    });

    const transactions = simplifyDebts(net);

    const result = {
      members: memberships.map(m => ({
        id: m.id,
        displayName: m.displayName || m.user.username,
        userId: m.userId,
        net: Math.round(net[m.id] * 100) / 100,
      })),
      transactions: transactions.map(t => ({
        from: memberMap[t.from],
        to: memberMap[t.to],
        amount: t.amount,
      })),
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Detailed breakdown: which expenses contribute to a member's balance
const getMemberBreakdown = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const gId = parseInt(groupId);
    const mId = parseInt(memberId);

    const expenses = await prisma.expense.findMany({
      where: {
        groupId: gId,
        isSettlement: false,
        OR: [{ paidById: mId }, { splits: { some: { memberId: mId } } }],
      },
      include: {
        splits: { where: { memberId: mId } },
        paidBy: true,
      },
      orderBy: { date: 'desc' },
    });

    const breakdown = expenses.map(exp => {
      const paid = exp.paidById === mId ? parseFloat(exp.amountInr) : 0;
      const owes = exp.splits.reduce((s, x) => s + parseFloat(x.amountInr), 0);
      return {
        expenseId: exp.id,
        description: exp.description,
        date: exp.date,
        totalAmount: parseFloat(exp.amountInr),
        paid,
        owes,
        net: paid - owes,
      };
    });

    res.json(breakdown);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getGroupBalances, getMemberBreakdown };
