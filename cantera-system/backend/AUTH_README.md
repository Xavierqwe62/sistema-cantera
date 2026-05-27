# JWT Authentication System

This directory contains a complete JWT authentication system for the Cantera backend API.

## Files Overview

### 1. `authConfig.js`
Configuration file for JWT and bcrypt settings.
- `JWT_SECRET`: Secret key for signing JWT tokens (from .env)
- `JWT_EXPIRE`: Token expiration time (default: 24h)
- `BCRYPT_ROUNDS`: Number of rounds for password hashing (10)
- `TOKEN_TYPE`: Authorization header type (Bearer)

### 2. `passwordUtils.js`
Utility functions for password and token management.

**Functions:**
- `hashPassword(password)`: Hash a plain text password using bcryptjs (10 rounds)
- `verifyPassword(plaintext, hash)`: Compare plain text password with stored hash
- `generateToken(userId, username, role, email)`: Create a new JWT token
- `verifyToken(token)`: Decode and verify a JWT token

### 3. `authMiddleware.js`
Express middleware for protecting routes that require authentication.

**Usage:**
```javascript
const authMiddleware = require('./authMiddleware');
app.get('/api/admin/dashboard', authMiddleware, dashboardController);
```

**Behavior:**
- Extracts token from `Authorization: Bearer <token>` header
- Returns 401 if header is missing or malformed
- Returns 401 if token is invalid
- Returns 403 if token is expired
- Attaches `req.user` with decoded token payload

### 4. `authController.js`
Route handlers for authentication endpoints.

**Functions:**
- `login(req, res)`: Authenticate user with username/password, return JWT token
- `register(req, res)`: Create new user account, return JWT token
- `refreshToken(req, res)`: Generate new token from existing valid token
- `verifyTokenEndpoint(req, res)`: Verify a token and return its payload
- `logout(req, res)`: Logout user (token invalidation on client side)

### 5. `authRoutes.js`
Express router defining authentication endpoints.

**Endpoints:**
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/refresh` - Refresh expired token
- `POST /api/auth/verify` - Verify token validity
- `POST /api/auth/logout` - Logout (requires valid token)
- `GET /api/auth/me` - Get current user info (requires valid token)

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install bcryptjs jsonwebtoken
```

### 2. Create .env File
Copy `.env.example` to `.env` and set values:
```bash
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRE=24h
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cantera_system
```

### 3. Initialize Database
Ensure your users table exists with the following structure:
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4. Import Routes in server.js
```javascript
const authRoutes = require('./authRoutes');
app.use('/api/auth', authRoutes);
```

### 5. Store Database Connection
Make database connection available to routes:
```javascript
app.set('db', connection);
```

## Usage Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@canteras.mx",
    "role": "admin",
    "full_name": "Admin Principal"
  }
}
```

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "password": "password123",
    "full_name": "New User"
  }'
```

### Protected Route
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Token Payload Structure

JWT tokens contain the following claims:
```javascript
{
  userId: 1,
  username: "admin",
  role: "admin",
  email: "admin@canteras.mx",
  iat: 1234567890,        // Issued at
  exp: 1234654290         // Expiration time
}
```

## Error Responses

### Missing Token (401)
```json
{
  "success": false,
  "error": "No authorization token"
}
```

### Invalid Credentials (401)
```json
{
  "success": false,
  "error": "Username or password incorrect"
}
```

### Token Expired (403)
```json
{
  "success": false,
  "error": "Token expired"
}
```

### Invalid Token (401)
```json
{
  "success": false,
  "error": "Invalid or malformed token"
}
```

## Security Considerations

1. **Password Hashing**: Uses bcryptjs with 10 rounds for secure password storage
2. **JWT Secret**: Must be stored in .env file and never committed to version control
3. **HTTPS**: Always use HTTPS in production (token in Authorization header)
4. **Token Expiration**: Tokens expire after 24 hours (configurable in .env)
5. **Token Refresh**: Implement token refresh endpoint for long-lived sessions
6. **SQL Injection**: Uses prepared statements with mysql2/promise

## Advanced Features

### Role-Based Access Control
```javascript
const authMiddleware = require('./authMiddleware');

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    next();
  };
}

app.delete('/api/users/:id', authMiddleware, requireRole('admin'), deleteUserController);
```

### Token Blacklisting
For logout functionality, implement a token blacklist:
```javascript
const blacklistedTokens = new Set();

function logout(req, res) {
  const token = req.headers.authorization.split(' ')[1];
  blacklistedTokens.add(token);
  res.json({ success: true, message: 'Logout successful' });
}

function checkTokenBlacklist(req, res, next) {
  const token = req.headers.authorization.split(' ')[1];
  if (blacklistedTokens.has(token)) {
    return res.status(401).json({ error: 'Token has been revoked' });
  }
  next();
}
```

## Troubleshooting

**"bcryptjs is not defined"**
- Run: `npm install bcryptjs`

**"jsonwebtoken is not defined"**
- Run: `npm install jsonwebtoken`

**"JWT_SECRET is not set"**
- Create .env file and set JWT_SECRET
- Restart server after adding .env

**"Database connection not available"**
- Ensure database connection is set with: `app.set('db', connection)`

## License

ISC
