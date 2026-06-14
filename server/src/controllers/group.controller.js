const prisma = require('../utils/prisma');

const createGroup = async (req, res) => {
  try {
    const { name, description, defaultCurrency } = req.body;
    const joinedAt = new Date(); joinedAt.setUTCHours(0, 0, 0, 0);
    const group = await prisma.group.create({
      data: {
        name,
        description: description || '',
        defaultCurrency: defaultCurrency || 'INR',
        createdById: req.user.id,
        memberships: {
          create: {
            userId: req.user.id,
            joinedAt,
            displayName: req.user.username,
          },
        },
      },
      include: { memberships: { include: { user: true } } },
    });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getGroups = async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      where: { memberships: { some: { userId: req.user.id, leftAt: null } } },
      include: {
        memberships: { include: { user: { select: { id: true, username: true, email: true } } } },
        _count: { select: { expenses: true } },
        expenses: {
          select: { amountInr: true, date: true, currency: true, paidById: true },
        },
      },
    });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getGroup = async (req, res) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        memberships: { include: { user: { select: { id: true, username: true, email: true } } } },
        expenses: {
          include: { paidBy: true, splits: { include: { member: true } } },
          orderBy: { date: 'desc' },
        },
      },
    });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { userId, displayName, joinedAt } = req.body;
    const membership = await prisma.groupMembership.create({
      data: {
        groupId: parseInt(req.params.id),
        userId: parseInt(userId),
        displayName: displayName || '',
        joinedAt: new Date(joinedAt),
      },
      include: { user: true },
    });
    res.json(membership);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { leftAt } = req.body;
    const membership = await prisma.groupMembership.update({
      where: { id: parseInt(req.params.memberId) },
      data: { leftAt: new Date(leftAt) },
    });
    res.json(membership);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createGroup, getGroups, getGroup, addMember, removeMember };
