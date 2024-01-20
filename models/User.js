const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserScheme = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Provide name"],
    minLength: 3,
    maxLength: 50,
  },
  email: {
    type: String,
    required: [true, "Please Provide email"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide valid email",
    ],
    unique: true,
  },

  password: {
    type: String,
    required: [true, "Please Provide password"],
    minLength: 6,
  },
  token: {
    type: String,
    minLength: 6,
    required: false,
  },
});



module.exports = mongoose.model("User", UserScheme);
