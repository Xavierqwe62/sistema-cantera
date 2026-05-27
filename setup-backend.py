import os
import json
from pathlib import Path

base_dir = r"c:\Users\Xavier\para proyectos web\proyecto\backend"
dirs = [
    base_dir,
    os.path.join(base_dir, "config"),
    os.path.join(base_dir, "middleware"),
    os.path.join(base_dir, "routes")
]

# Create directories
for dir_path in dirs:
    Path(dir_path).mkdir(parents=True, exist_ok=True)
    print(f"Created: {dir_path}")

# Create .gitignore
gitignore_content = """node_modules/
.env
.env.local
.env.*.local
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
dist/
build/
.vscode/
.idea/
"""

with open(os.path.join(base_dir, ".gitignore"), "w") as f:
    f.write(gitignore_content)

# Create package.json
package_data = {
    "name": "canteras-renacimiento-api",
    "version": "1.0.0",
    "description": "Admin API for Canteras Renacimiento",
    "main": "server.js",
    "scripts": {
        "start": "node server.js",
        "dev": "nodemon server.js"
    },
    "dependencies": {
        "express": "^4.18.2",
        "mysql2": "^3.6.0",
        "jsonwebtoken": "^9.0.0",
        "bcryptjs": "^2.4.3",
        "dotenv": "^16.0.3",
        "cors": "^2.8.5",
        "multer": "^1.4.5-lts.1",
        "validator": "^13.9.0"
    },
    "devDependencies": {
        "nodemon": "^3.0.1"
    }
}

with open(os.path.join(base_dir, "package.json"), "w") as f:
    json.dump(package_data, f, indent=2)

# Create .env
env_content = """PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=canterasrenacimiento
JWT_SECRET=your-secret-key-change-in-production-12345abcde
JWT_EXPIRE=24h
NODE_ENV=development
"""

with open(os.path.join(base_dir, ".env"), "w") as f:
    f.write(env_content)

# Create server.js
server_content = """require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', routes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
"""

with open(os.path.join(base_dir, "server.js"), "w") as f:
    f.write(server_content)

# Create config/database.js
database_content = """const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'canterasrenacimiento',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

module.exports = pool;
"""

with open(os.path.join(base_dir, "config", "database.js"), "w") as f:
    f.write(database_content)

# Create config/jwt.js
jwt_content = """const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production-12345abcde';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';

const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  signToken,
  verifyToken,
  decodeToken,
  JWT_SECRET,
  JWT_EXPIRE
};
"""

with open(os.path.join(base_dir, "config", "jwt.js"), "w") as f:
    f.write(jwt_content)

# Create middleware/errorHandler.js
error_handler_content = """const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
"""

with open(os.path.join(base_dir, "middleware", "errorHandler.js"), "w") as f:
    f.write(error_handler_content)

# Create middleware/auth.js
auth_content = """const { verifyToken } = require('../config/jwt');

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization header provided'
      });
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = auth;
"""

with open(os.path.join(base_dir, "middleware", "auth.js"), "w") as f:
    f.write(auth_content)

# Create middleware/validateInput.js
validate_content = """const validateInput = (schema) => {
  return (req, res, next) => {
    if (!schema) {
      return next();
    }

    const errors = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        errors[field] = `${field} is required`;
        continue;
      }

      if (rules.type && value !== undefined && typeof value !== rules.type) {
        errors[field] = `${field} must be of type ${rules.type}`;
      }

      if (rules.minLength && value && value.length < rules.minLength) {
        errors[field] = `${field} must be at least ${rules.minLength} characters`;
      }

      if (rules.maxLength && value && value.length > rules.maxLength) {
        errors[field] = `${field} must be at most ${rules.maxLength} characters`;
      }

      if (rules.pattern && value && !rules.pattern.test(value)) {
        errors[field] = `${field} has invalid format`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

module.exports = validateInput;
"""

with open(os.path.join(base_dir, "middleware", "validateInput.js"), "w") as f:
    f.write(validate_content)

# Create routes/index.js
routes_content = """const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running'
  });
});

// Route placeholders for future implementation
// Import and use routes here as they are created:
// const authRoutes = require('./auth');
// const userRoutes = require('./users');
// const settingsRoutes = require('./settings');
// 
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/settings', settingsRoutes);

module.exports = router;
"""

with open(os.path.join(base_dir, "routes", "index.js"), "w") as f:
    f.write(routes_content)

print("✓ All files created successfully!")
print(f"✓ Backend structure created at: {base_dir}")
