const { PrismaClient } = require('../generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function signup(req, res, next) {
  try {
    const { email, password, inviteCode } = req.body;

    if (!email || !password || !inviteCode) {
      return res
        .status(400)
        .json({ error: "Email, password and invite code are required" });
    }

    if (process.env.INVITE_CODE && inviteCode !== process.env.INVITE_CODE) {
      return res.status(403).json({ error: "Invalid invite code." });
    }

    const total = await prisma.user.count();
    if (process.env.MAX_USERS && total >= parseInt(process.env.MAX_USERS, 10)) {
      return res
        .status(503)
        .json({ error: "Registrations are closed for now." });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: "Email already in use." });
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true, createdAt: true },
    });

    return res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { signup };