const express = require("express");
const rateLimit = require("express-rate-limit");
const { signup, login } = require("../controllers/authController");
const validate = require('../middleware/validate');
const { signupSchema, loginSchema } = require('../validations/authSchemas');


const router = express.Router();

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Too many signup attempts, please try again later." },
});

router.post("/signup", signupLimiter, validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);

module.exports = router;
