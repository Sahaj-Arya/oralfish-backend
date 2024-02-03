const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: {
    type: String,
    default: "",
  },
  token: { type: String, default: "" },
  phone: { type: String, required: true, unique: true },
  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  isProfileVerified: { type: Boolean, default: false },
  isProfileComplete: { type: Boolean, default: false },
  stepsDone: { type: Number, default: 0 },
  otp: { type: String, default: "" },
  fcm_token: { type: String, default: "" },
});

UserSchema.index({ phone: 1 }, { unique: true });

module.exports = mongoose.model("User", UserSchema);
