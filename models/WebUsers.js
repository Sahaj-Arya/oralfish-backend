const mongoose = require("mongoose");

const WebUsersSchema = new mongoose.Schema({
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  password: { type: String, required: true },
  email: {
    type: String,
    required: true,
  },
  token: { type: String, default: "" },
  phone: { type: String, unique: true },
  role: { type: String, default: "manager" },
  profile_image: { type: String, default: "" },
  access: [String],
});

module.exports = mongoose.model("WebUsers", WebUsersSchema, "WebUsers");
