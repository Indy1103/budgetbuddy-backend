const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// List transactions for the authenticated user
async function getTransactions(req, res, next) {
  try {
    const txs = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
    });
    res.json(txs);
  } catch (err) {
    next(err);
  }
}

// Create a new transaction
async function createTransaction(req, res, next) {
  try {
    const { amount, type, category, note, date } = req.body;
    const tx = await prisma.transaction.create({
      data: {
        userId: req.user.id,
        amount,
        type,
        category,
        note,
        date: new Date(date),
      },
    });
    res.status(201).json(tx);
  } catch (err) {
    next(err);
  }
}

// Update an existing transaction
async function updateTransaction(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const tx = await prisma.transaction.updateMany({
      where: { id, userId: req.user.id },
      data: updates,
    });
    if (tx.count === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// Delete a transaction
async function deleteTransaction(req, res, next) {
  try {
    const { id } = req.params;
    const tx = await prisma.transaction.deleteMany({
      where: { id, userId: req.user.id },
    });
    if (tx.count === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};