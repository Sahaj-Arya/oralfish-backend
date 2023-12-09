const { BadRequestError } = require("../errors");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
// Authentication

// to register/signup
const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const { _id, name, email } = user;

  const token = jwt.sign({ userId: _id, name: name }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  res.status(StatusCodes.CREATED).json({ user: { _id, email, name }, token });
};

// to login
const login = async (req, res) => {
  res.send("login");
};

module.exports = { register, login };
