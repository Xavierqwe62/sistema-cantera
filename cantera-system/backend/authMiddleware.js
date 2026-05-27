// Authentication Middleware
// Verifies JWT tokens and attaches user information to requests

const { verifyToken } = require('../passwordUtils');
const { TOKEN_TYPE } = require('../authConfig');

/**
 * Middleware to verify JWT token from Authorization header
 * Expects header format: Authorization: Bearer <token>
 * Attaches req.user with decoded token payload
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 * @returns {void}
 */
function authMiddleware(req, res, next) {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    // Check if header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token',
      });
    }

    // Split header to extract token
    const parts = authHeader.split(' ');
    
    // Verify header format: "Bearer <token>"
    if (parts.length !== 2 || parts[0] !== TOKEN_TYPE) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format',
      });
    }

    const token = parts[1];

    // Verify token
    const decoded = verifyToken(token);

    // Attach user information to request
    req.user = decoded;

    // Proceed to next middleware/route
    next();
  } catch (error) {
    // Check if token is expired
    if (error.message.includes('expired')) {
      return res.status(403).json({
        success: false,
        error: 'Token expired',
      });
    }

    // Generic token verification error
    return res.status(401).json({
      success: false,
      error: 'Invalid or malformed token',
    });
  }
}

module.exports = authMiddleware;
