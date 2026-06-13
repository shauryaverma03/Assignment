const prisma = require('../utils/prisma');

const createSettlement = async (req, res) => {
  try {
    const { groupId, paidById, paidToId, amount, date, notes } = req.body;
    const settlement = await prisma.settlement.create({
      data: {
        groupId: parseInt(groupId),
        paidById: parseInt(paidById),
        paidToId: parseInt(paidToId),
        amount: parseFloat(amount),
        date: new Date(date),
        notes: notes || '',
      },
      include: {
        paidBy: { include: { user: true } },
        paidTo: { include: { user: true } },
      },
    });
    res.json(settlement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSettlements = async (req, res) => {
  try {
    const { groupId } = req.query;
    const settlements = await prisma.settlement.findMany({
      where: { groupId: parseInt(groupId) },
      include: {
        paidBy: { include: { user: true } },
        paidTo: { include: { user: true } },
      },
      orderBy: { date: 'desc' },
    });
    res.json(settlements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createSettlement, getSettlements };
