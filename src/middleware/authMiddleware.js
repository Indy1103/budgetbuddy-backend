const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Invalid Authorization format' });
      }

      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
    
        req.user = {
          id: payload.userId,
          email: payload.email
        };
        next();
      } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    }
    
    module.exports = authMiddleware;