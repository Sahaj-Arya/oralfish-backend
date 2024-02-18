const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("Users", UsersSchema, "users");
