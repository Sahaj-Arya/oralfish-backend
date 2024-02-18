const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  email: {
    type: String,
    default: "",
  },
  token: { type: String, default: "" },
  phone: { type: String, unique: true },
  fcm_token: { type: String, default: "" },
  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  isProfileVerified: { type: Boolean, default: false },
  isProfileComplete: { type: Boolean, default: false },
  stepsDone: { type: Number, default: 1 },
  otp: { type: String, default: "" },
  profile_image: { type: String, default: "" },
  dob: { type: String, default: "" },
  gender: { type: String, default: "" },
  address: { type: String, default: "" },
  pan_image: { type: String, default: "" },
  pan_no: { type: String, default: "" },
  income: { type: String, default: "" },
  occupation: { type: String, default: "" },
  work_experience: { type: String, default: "" },
  work_experience: { type: String, default: "" },
  bank_details: [
    {
      bank_name: String,
      bank_ifsc: String,
      account_no: String,
      bank_passbook: String,
      cancelled_check: String,
    },
  ],
});

UserSchema.index({ phone: 1 }, { unique: true });

module.exports = mongoose.model("Users", UserSchema, "users");
