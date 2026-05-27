/**
 * EXAMPLE: How to integrate JWT authentication into your Express server
 * 
 * Copy the relevant parts of this file into your main server.js
 */

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Import authentication routes
const authRoutes = require('./authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection setup
let db;

async function initializeDatabase() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'cantera_system',
      port: process.env.DB_PORT || 3306,
    });
    console.log('✓ Database connected');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
}

// Make database available to routes
app.set('db', db);

// Initialize database before starting server
initializeDatabase().then(() => {
  // Register authentication routes
  // This makes available:
  // - POST /api/auth/login
  // - POST /api/auth/register
  // - POST /api/auth/refresh
  // - POST /api/auth/verify
  // - POST /api/auth/logout
  // - GET /api/auth/me
  app.use('/api/auth', authRoutes);

  // Example: Protected route using authentication middleware
  const authMiddleware = require('./authMiddleware');
  
  app.get('/api/admin/dashboard', authMiddleware, (req, res) => {
    res.json({
      success: true,
      message: 'Welcome to admin dashboard',
      user: req.user,
    });
  });

  // Example: Role-based protected route
  app.delete('/api/admin/users/:id', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can delete users',
      });
    }
    // Delete user logic here
    res.json({ success: true, message: 'User deleted' });
  });

  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Auth endpoints available at http://localhost:${PORT}/api/auth`);
  });
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
