// Authentication Configuration
// Manages JWT secrets, expiration times, and bcrypt settings

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';
const BCRYPT_ROUNDS = 10;
const TOKEN_TYPE = 'Bearer';

module.exports = {
  JWT_SECRET,
  JWT_EXPIRE,
  BCRYPT_ROUNDS,
  TOKEN_TYPE,
};
