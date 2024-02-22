const express = require("express");
const {
  login,
  register,
  loginViaOtp,
  verifyOtp,
  logout,
} = require("../controllers/auth");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/login-via-otp", loginViaOtp);
router.post("/verify-otp", verifyOtp);
router.post("/logout", verifyToken, logout);

module.exports = router;
