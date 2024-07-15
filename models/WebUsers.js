const mongoose = require("mongoose");

const WebUsersSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  password: { type: String, required: true },
  email: { type: String, unique: true },
  token: { type: String, default: "" },
  phone: { type: String, default: null, sparse: true },
  role: { type: String, default: "manager" },
  profile_image: { type: String, default: "" },
  access: [String],
});

module.exports = mongoose.model("WebUsers", WebUsersSchema, "webusers");
