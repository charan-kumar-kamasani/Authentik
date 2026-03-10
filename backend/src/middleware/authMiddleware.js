const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
  token = req.headers.authorization.split(" ")[1];
  const secret = process.env.JWT_SECRET || 'SECRET';
  const decoded = jwt.verify(token, secret);

      req.user = await User.findById(decoded.userId)
        .select("-password")
        .populate('brandId');

      if (!req.user) {
        return res.status(401).json({ error: "Not authorized, user not found", message: "Not authorized, user not found" });

      }

      // Check if user is blocked
      if (req.user.status === 'blocked') {
        return res.status(403).json({ error: "Your account is blocked. Please contact support.", message: "Your account is blocked. Please contact support." });

      }

      // Check if user's brand is blocked (for authorizers/creators)
      if (['authorizer', 'creator', 'company'].includes(req.user.role) && req.user.brandId && req.user.brandId.status === 'blocked') {
        return res.status(403).json({ error: "The associated brand is blocked. Please contact support.", message: "The associated brand is blocked. Please contact support." });

      }


      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: "Not authorized, token failed", message: "Not authorized, token failed" });

    }
  } else {
    res.status(401).json({ error: "Not authorized, no token", message: "Not authorized, no token" });

  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
