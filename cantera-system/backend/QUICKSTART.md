# JWT Authentication - Quick Start Guide

## Files Created

```
backend/
├── authConfig.js             ← Configuration (JWT_SECRET, JWT_EXPIRE, BCRYPT_ROUNDS)
├── passwordUtils.js          ← Password hashing & JWT token functions
├── authMiddleware.js         ← Route protection middleware
├── authController.js         ← Login, register, refresh, verify endpoints
├── authRoutes.js             ← Express router with all auth routes
├── .env.example              ← Environment variables template
├── AUTH_README.md            ← Full documentation
└── SERVER_INTEGRATION_EXAMPLE.js ← How to integrate into server.js
```

## Quick Setup (5 steps)

### 1. Install Dependencies
```bash
cd backend
npm install bcryptjs jsonwebtoken
```

### 2. Create .env File
```bash
cp .env.example .env
```

Edit `.env` and set:
```
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=24h
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cantera_system
```

### 3. Create Database Table
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
app.set('db', connection); // Make DB available to routes
```

### 5. Test It
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Result:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { "id": 1, "username": "admin", "role": "admin", ... }
# }
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with username/password |
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/refresh` | Refresh expired token |
| GET | `/api/auth/me` | Get current user (requires token) |

## Using Middleware on Routes

```javascript
const authMiddleware = require('./authMiddleware');

// Protect a route
app.get('/api/admin/dashboard', authMiddleware, (req, res) => {
  // req.user contains: { userId, username, role, email }
  res.json({ user: req.user });
});

// Check admin role
app.delete('/api/users/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  // Delete logic here
});
```

## Key Security Features

✅ Passwords hashed with bcryptjs (10 rounds)
✅ JWT tokens with 24h expiration
✅ JWT_SECRET in environment variables
✅ SQL injection prevention (prepared statements)
✅ Bearer token format validation
✅ Proper HTTP status codes

## Troubleshooting

**"Cannot find module 'bcryptjs'"**
→ Run: `npm install bcryptjs`

**"Cannot find module 'jsonwebtoken'"**
→ Run: `npm install jsonwebtoken`

**"JWT_SECRET is undefined"**
→ Create .env file with JWT_SECRET value

**"Token expired" on login**
→ Check JWT_EXPIRE value in .env (should be "24h")

## Documentation

For detailed information, see:
- `AUTH_README.md` - Full documentation
- `SERVER_INTEGRATION_EXAMPLE.js` - Integration patterns
- `.env.example` - All configuration options

---

Status: ✅ Ready to Use
