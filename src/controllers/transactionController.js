const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

// List transactions for the authenticated user
async function getTransactions(req, res, next) {
  try {
    const txs = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { date: "desc" },
    });
    res.json(txs);
  } catch (err) {
    next(err);
  }
}

// Create a new transaction
async function createTransaction(req, res, next) {
  try {

    if (!req.user?.email) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { amount, type, category, note, date } = req.body;
    const tx = await prisma.transaction.create({
      data: {
        user: {
          connect: { email: req.user.email  },
        },
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
    const { amount, type, category, note, date } = req.body;

    // Build your updates object, converting date to a real Date
    const data = {
      ...(amount     !== undefined && { amount }),
      ...(type       && { type }),
      ...(category   && { category }),
      ...(note       !== undefined && { note }),
      ...(date       && { date: new Date(date) }),
    };

    const result = await prisma.transaction.updateMany({
      where: { id, userId: req.user.id },
      data,
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
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
    if (tx.count === 0) return res.status(404).json({ error: "Not found" });
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
