const { ZodError } = require('zod');

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // Map Zod errors into a simple array or object
      const errors = result.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({ errors });
    }
    req.body = result.data;  // now typed and safe
    next();
  };
}

module.exports = validateBody;