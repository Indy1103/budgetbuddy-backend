require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const authRouter = require('./routes/auth');
const { PrismaClient } = require('./generated/prisma');

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET'];

  for (const name of requiredEnvVars) {
    if (!process.env[name]) {
      console.error(`Missing required env var: ${name}`);
      process.exit(1);
    }
  }

const prisma = new PrismaClient();
const app = express();

app.use(helmet());

// Configure CORS dynamically using the environment variable
const allowedOrigins = [
  'http://localhost:3000', // Allow your local React development server
  'http://localhost:5174', // Allow your other local React development server if you use it
  process.env.FRONTEND_URL // Allow your deployed Vercel frontend URL
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // and allow origins that are in our allowedOrigins list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Reject origins not in the allowed list
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      callback(new Error(msg), false);
    }
  },
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    return res.json({ status: 'OK', users });
  } catch (err) {
    console.error('Health check failed:', err);
    return res.status(500).json({ status: 'ERROR', error: err.message });
  }
});

app.use('/api/auth', authRouter);

const transactionsRouter = require('./routes/transactions');
app.use('/api/transactions', transactionsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message });
  });