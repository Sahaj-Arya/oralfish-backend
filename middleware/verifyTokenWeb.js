const jwt = require("jsonwebtoken");
const WebUsers = require("../models/WebUsers");

const verifyTokenWeb = (req, res, next) => {
  const token = req.header("authorization");
  console.log("verifyTokenWeb", token);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied!!!. No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    const checkUser = await WebUsers.findOne({ phone: user?.phone });
    console.log(checkUser);
    if (!checkUser) {
      return res.status(401).json({ message: "Invalid user" });
    }

    if (checkUser?.token?.length < 1) {
      res.status(200).json({
        message: "Log out successful",
        success: true,
      });
    }

    if (!checkUser?.token.includes(token)) {
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