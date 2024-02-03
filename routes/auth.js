const express = require("express");
const {
  login,
  register,
  loginViaOtp,
  verifyOtp,
} = require("../controllers/auth");
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/login-via-otp", loginViaOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router;
