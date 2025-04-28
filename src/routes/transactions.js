const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const validate = require('../middleware/validate');
const {
  createTransactionSchema,
  updateTransactionSchema
} = require('../validations/transactionSchemas');


const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

const router = express.Router();

// Apply authMiddleware to *all* /api/transactions routes
router.use(authMiddleware);

// GET /api/transactions/      → list current user’s transactions
router.get('/', getTransactions);

router.post('/', 
    validate(createTransactionSchema),
    createTransaction);

router.put('/:id', 
    validate(updateTransactionSchema),
    updateTransaction);

router.delete('/:id', deleteTransaction);

module.exports = router;