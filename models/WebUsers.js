const mongoose = require("mongoose");

const WebUsersSchema = new mongoose.Schema({
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  password: { type: String, required: true },
  email: { type: String, unique: true },
  token: { type: String, default: "" },
  // Make phone optional and allow null to represent the absence of a phone number
  phone: { type: String, default: null, sparse: true },
  role: { type: String, default: "manager" },
  profile_image: { type: String, default: "" },
  access: [String],
});

module.exports = mongoose.model("WebUsers", WebUsersSchema, "webusers");
