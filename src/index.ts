import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { initDb } from './db';
import authRouter from './modules/auth/auth.router';
import rolesRouter from './modules/roles/roles.router';
import candidatesRouter from './modules/candidates/candidates.router';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://hr-screener-fe-git-main-harsh9619s-projects.vercel.app',
  'https://hr-screener-7c45gk7in-harsh9619s-projects.vercel.app',
  'https://hr-screener-fe.vercel.app'
];

const envOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim()).filter(Boolean)
  : defaultOrigins;

const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultOrigins]));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));

// Mount module routers directly
app.use('/api/auth', authRouter);
app.use('/api/roles', rolesRouter);
app.use('/api', candidatesRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

async function startServer() {
  try {
    // Initialize DB schema automatically
    await initDb();
    app.listen(PORT, () => {
      console.log(`Candidate Screener API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server or database connection:', error);
  }
}

startServer();
