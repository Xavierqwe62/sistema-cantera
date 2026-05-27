// Authentication Controller
// Handles login, register, token refresh, and token verification

const { hashPassword, verifyPassword, generateToken, verifyToken } = require('../passwordUtils');

/**
 * Login endpoint
 * Validates username/password and returns JWT token if credentials match
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with token or error
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required',
      });
    }

    // Query database for user (using mysql2/promise connection)
    const connection = req.app.get('db');
    if (!connection) {
      return res.status(500).json({
        success: false,
        error: 'Database connection not available',
      });
    }

    // Use prepared statement to prevent SQL injection
    const query = 'SELECT id, username, email, password_hash, role, full_name FROM users WHERE username = ?';
    const [rows] = await connection.execute(query, [username]);

    // Check if user exists
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Username or password incorrect',
      });
    }

    const user = rows[0];

    // Compare passwords using bcryptjs
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Username or password incorrect',
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.username, user.role, user.email);

    // Return success response with token and user info
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed: ' + error.message,
    });
  }
}

/**
 * Register endpoint
 * Creates a new user with hashed password and returns JWT token
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with token or error
 */
async function register(req, res) {
  try {
    const { username, email, password, full_name, role } = req.body;

    // Validate required fields
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, password, and full_name are required',
      });
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
      });
    }

    // Get database connection
    const connection = req.app.get('db');
    if (!connection) {
      return res.status(500).json({
        success: false,
        error: 'Database connection not available',
      });
    }

    // Check if username already exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Username or email already exists',
      });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Insert new user into database
    const userRole = role || 'user'; // Default role is 'user'
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, password_hash, full_name, userRole]
    );

    // Generate JWT token
    const token = generateToken(result.insertId, username, userRole, email);

    // Return success response
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: result.insertId,
        username,
        email,
        role: userRole,
        full_name,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed: ' + error.message,
    });
  }
}

/**
 * Refresh token endpoint
 * Generates a new JWT token from an existing valid token
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with new token
 */
async function refreshToken(req, res) {
  try {
    const { token } = req.body;

    // Validate token is provided
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
      });
    }

    // Verify existing token
    const decoded = verifyToken(token);

    // Generate new token with same payload
    const newToken = generateToken(
      decoded.userId,
      decoded.username,
      decoded.role,
      decoded.email
    );

    return res.status(200).json({
      success: true,
      token: newToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(401).json({
      success: false,
      error: 'Token refresh failed: ' + error.message,
    });
  }
}

/**
 * Verify token endpoint
 * Checks if a token is valid and returns decoded payload
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with decoded token or error
 */
async function verifyTokenEndpoint(req, res) {
  try {
    const { token } = req.body;

    // Validate token is provided
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    return res.status(200).json({
      success: true,
      user: decoded,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      error: 'Token verification failed: ' + error.message,
    });
  }
}

/**
 * Logout endpoint (optional)
 * Currently just returns success (token is stateless)
 * For logout functionality, tokens can be blacklisted on the backend
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response
 */
function logout(req, res) {
  try {
    // With JWT tokens, logout is handled on the client side
    // by removing the token from localStorage/sessionStorage
    // For added security, implement token blacklisting on the backend

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Logout failed: ' + error.message,
    });
  }
}

module.exports = {
  login,
  register,
  refreshToken,
  verifyTokenEndpoint,
  logout,
};
