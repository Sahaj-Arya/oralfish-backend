const jwt = require("jsonwebtoken");
const WebUsers = require("../models/WebUsers");

const verifyTokenWeb = (req, res, next) => {
  const token = req.header("authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied!!!. No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    const checkUser = await WebUsers.findOne({ email: user?.email });

    if (!checkUser) {
      return res.status(401).json({ message: "Invalid token!!!!" });
    }

    if (err) {
      return res.status(401).json({ message: "Invalid token!!!!" });
    }

    req.user = checkUser;
    next();
  });
};

module.exports = verifyTokenWeb;
