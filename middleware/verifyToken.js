const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header("authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied!!!. No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token!!!!" });
    }

    req.user = user;
    next();
  });
};

module.exports = verifyToken;
