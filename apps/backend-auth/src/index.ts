import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import uploadRoutes from './routes/upload';
import { cvRouter } from './routes/cv';

dotenv.config();

// Log environment variables for debugging
console.log('Environment Variables:', {
  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID ? 'Set' : 'Not set',
  NODE_ENV: process.env.NODE_ENV || 'development'
});

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:9002', // Frontend development server
  // Add other allowed origins as needed
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// File upload routes
app.use('/api', uploadRoutes);

// CV parsing route
app.use('/api', cvRouter);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Auth routes
app.use('/auth', authRoutes);

// Routes
app.get('/', (_req, res) => {
  res.send(`
    <h1>TrueMatch API</h1>
    <p>Welcome to the TrueMatch API</p>
    <p>Available endpoints:</p>
    <ul>
      <li><a href="/auth/linkedin">Login with LinkedIn</a></li>
      <li>POST /api/cv - Upload a CV (PDF only, max 5MB)</li>
      <li>GET /uploads/:filename - Get an uploaded file</li>
    </ul>
  `);
});

app.use('/auth', authRoutes);

// Simple error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
