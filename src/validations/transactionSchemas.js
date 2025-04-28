const { z } = require('zod');

const createTransactionSchema = z.object({
  amount: z.number(),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().nonempty(),
  note: z.string().optional(),
  date: z.string().refine((s) => !isNaN(Date.parse(s)), {
    message: 'Invalid date format',
  }),
});

const updateTransactionSchema = createTransactionSchema.partial();

module.exports = { createTransactionSchema, updateTransactionSchema };