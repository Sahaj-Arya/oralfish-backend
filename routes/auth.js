const express = require("express");
const {
  login,
  register,
  loginViaOtp,
  verifyOtp,
  logout,
  tokenVerification,
} = require("../controllers/auth");
const verifyToken = require("../middleware/verifyToken");
const verifyTokenWeb = require("../middleware/verifyTokenWeb");
const router = express.Router();

router.post("/login", login);
// router.post("/verify-token-web", verifyTokenWeb, tokenVerification);
router.post("/register", register);
router.post("/login-via-otp", loginViaOtp);
router.post("/verify-otp", verifyOtp);
router.post("/logout", verifyToken, logout);

module.exports = router;
