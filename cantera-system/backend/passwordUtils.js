// Password Utility Functions
// Handles password hashing, verification, and JWT token operations

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRE, BCRYPT_ROUNDS } = require('../authConfig');

/**
 * Hash a plain text password using bcryptjs
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

/**
 * Verify plain text password against hashed password
 * @param {string} plaintext - Plain text password from user
 * @param {string} hash - Hashed password from database
 * @returns {Promise<boolean>} - True if password matches, false otherwise
 */
async function verifyPassword(plaintext, hash) {
  try {
    const isMatch = await bcrypt.compare(plaintext, hash);
    return isMatch;
  } catch (error) {
    throw new Error(`Password verification failed: ${error.message}`);
  }
}

/**
 * Generate JWT token for a user
 * @param {number} userId - User ID
 * @param {string} username - Username
 * @param {string} role - User role (admin, user, etc.)
 * @param {string} email - User email
 * @returns {string} - JWT token
 */
function generateToken(userId, username, role, email) {
  try {
    const payload = {
      userId,
      username,
      role,
      email,
    };
    
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });
    
    return token;
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token
 * @returns {object} - Decoded token payload
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
};
