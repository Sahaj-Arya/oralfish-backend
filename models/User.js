const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: {
    type: String,
    default: "",
  },
  token: [],
  phone: { type: String, unique: true },
  fcm_token: [],
  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  isProfileVerified: { type: Boolean, default: false },
  isProfileComplete: { type: Boolean, default: false },
  stepsDone: { type: Number, default: 1 },
  otp: { type: String, default: "" },
  profile_image: { type: String, default: "" },
  dob: { type: String, default: "" },
  gender: { type: String, default: "" },
  pincode: { type: String, default: "" },
  pan_image: { type: String, default: "" },
  pan_no: { type: String, default: "" },
  income: { type: String, default: "" },
  occupation: { type: String, default: "" },
  work_experience: { type: String, default: "" },
  referral_id: { type: String, default: "" },
  wallet: { type: String, default: "0" },
  redeem_wallet: { type: Boolean, default: false },

  bank_details: [
    {
      bank_name: String,
      bank_ifsc: String,
      account_no: String,
      bank_passbook: String,
      cancelled_check: String,
      pan_image_new: String,
      pan_no_new: String,
      beneficiary_name: String,
      default: Boolean,
    },
  ],
  order_settlement: [],
});

UserSchema.index({ phone: 1 }, { unique: true });

module.exports = mongoose.model("Users", UserSchema, "users");
