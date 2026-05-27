// Authentication Routes
// Defines Express routes for authentication endpoints

const express = require('express');
const router = express.Router();
const authController = require('../authController');
const authMiddleware = require('../authMiddleware');

/**
 * POST /api/auth/login
 * Login with username and password
 * Returns JWT token and user information
 * 
 * Request body:
 * {
 *   "username": "admin",
 *   "password": "password123"
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "token": "eyJhbGc...",
 *   "user": { "id": 1, "username": "admin", "email": "admin@canteras.mx", "role": "admin", "full_name": "Admin Principal" }
 * }
 * 
 * Response (401):
 * {
 *   "success": false,
 *   "error": "Username or password incorrect"
 * }
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/register
 * Create a new user account
 * Returns JWT token and user information
 * 
 * Request body:
 * {
 *   "username": "newuser",
 *   "email": "user@example.com",
 *   "password": "password123",
 *   "full_name": "New User",
 *   "role": "user"
 * }
 * 
 * Response (201):
 * {
 *   "success": true,
 *   "token": "eyJhbGc...",
 *   "user": { "id": 2, "username": "newuser", "email": "user@example.com", "role": "user", "full_name": "New User" }
 * }
 * 
 * Response (400):
 * {
 *   "success": false,
 *   "error": "Username or email already exists"
 * }
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/refresh
 * Refresh an existing JWT token
 * Returns a new JWT token
 * 
 * Request body:
 * {
 *   "token": "eyJhbGc..."
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "token": "eyJhbGc..."
 * }
 */
router.post('/refresh', authController.refreshToken);

/**
 * POST /api/auth/verify
 * Verify a JWT token
 * Returns decoded token payload if valid
 * 
 * Request body:
 * {
 *   "token": "eyJhbGc..."
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "user": { "userId": 1, "username": "admin", "role": "admin", "email": "admin@canteras.mx" }
 * }
 * 
 * Response (401):
 * {
 *   "success": false,
 *   "error": "Token verification failed"
 * }
 */
router.post('/verify', authController.verifyTokenEndpoint);

/**
 * POST /api/auth/logout
 * Logout the user (token is invalidated on client side)
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "message": "Logout successful"
 * }
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * GET /api/auth/me
 * Get current user information (requires valid token)
 * Uses authMiddleware to verify token
 */
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

module.exports = router;
