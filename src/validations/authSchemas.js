// src/validations/authSchemas.js
const { z } = require('zod');

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),           
  inviteCode: z.string().nonempty(),    
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().nonempty(),
});

module.exports = { signupSchema, loginSchema };