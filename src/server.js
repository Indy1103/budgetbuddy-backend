require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path'); // Import the 'path' module
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
// If you are serving your frontend from this same Express server,
// you might not strictly need CORS for your own frontend requests,
// but keeping local development origins is still useful.
const allowedOrigins = [
  'http://localhost:3000', // Allow your local React development server
  'http://localhost:5174', // Allow your other local React development server if you use it
  // If you are serving the frontend from this backend, you might not need the FRONTEND_URL here
  // process.env.FRONTEND_URL // Allow your deployed Vercel frontend URL (only needed if frontend is NOT served by this backend)
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


// --- ADD STATIC FILE SERVING AND SPA FALLBACK ---

// Define the path to your frontend's built files.
// IMPORTANT: This path must be correct relative to THIS server.js file
// AFTER your frontend build output has been copied into the Docker container.
// Common locations inside a Docker container are /app/public or /app/build.
// If your server.js is at /app/src, and frontend build is copied to /app/public,
// the path would be path.join(__dirname, '..', 'public');
// If your server.js is at /app/src, and frontend build is copied to /app/build,
// the path would be path.join(__dirname, '..', 'build');
// If your server.js is at /app/ and frontend build is copied to /app/public,
// the path would be path.join(__dirname, 'public');
// ADJUST THE PATH BELOW based on your Dockerfile's COPY command for the frontend build!
const frontendBuildPath = path.join(__dirname, '..', 'build'); // <-- ADJUST THIS PATH

console.log(`Serving static files from: ${frontendBuildPath}`); // Log the path being used

// Serve static files from the frontend build directory
// This middleware will serve files like index.html, bundle.js, style.css, etc.
app.use(express.static(frontendBuildPath));


// Health check route (keep this before the SPA fallback, but after static)
// Requests to /health will be handled here first.
app.get('/health', async (req, res) => {
  try {
    // Attempt a simple query to check database connection
    await prisma.$queryRaw`SELECT 1`; // Simple query that doesn't require tables
    // const users = await prisma.user.findMany({ take: 1 }); // Or check if user table exists/is accessible
    return res.json({ status: 'OK', database: 'Connected' });
  } catch (err) {
    console.error('Health check failed:', err);
    // Send a more detailed error in development/debugging
    const errorDetails = process.env.NODE_ENV !== 'production' ? err.stack : err.message;
    return res.status(500).json({ status: 'ERROR', error: 'Database connection failed', details: errorDetails });
  }
});


// API routes (keep these before the SPA fallback, but after static)
// Requests to /api/auth/* and /api/transactions/* will be handled here.
app.use('/api/auth', authRouter);
const transactionsRouter = require('./routes/transactions');
app.use('/api/transactions', transactionsRouter);


// SPA Fallback: For any GET request that hasn't been matched by the static files
// or the API routes above, send the index.html file.
// This should be the LAST route defined.
app.get('*', (req, res) => {
  console.log(`SPA Fallback: Serving index.html for request: ${req.path}`); // Log fallback hits
  // Ensure the path to index.html is correct
  res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
    if (err) {
      console.error(`Error sending index.html for ${req.path}:`, err);
      res.status(500).send('Error loading the application.');
    }
  });
});

// --- END STATIC FILE SERVING AND SPA FALLBACK ---


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Error handling middleware (keep this last)
app.use((err, req, res, next) => {
    console.error(err);
    // Use err.message for production, err.stack for debugging if needed
    const errorResponse = {
      error: err.message || 'An unexpected error occurred.',
      // stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined // Optionally include stack in dev
    };
    res.status(err.statusCode || 500).json(errorResponse);
  });
