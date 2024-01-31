const { BadRequestError } = require("../errors");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// Register / Signup
const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(401).json({ message: "User exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const encryptedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    ...req.body,
    password: encryptedPassword,
  });

  const token = jwt.sign(
    { email: email, id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );

  user.token = token;
  await user.save();

  res
    .status(StatusCodes.CREATED)
    .json({ user: { id: user._id, email, name }, token });
};

// To Login
const login = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: `No User by email ${email}` });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { email: email, id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );

  user.token = token;
  await user.save();

  res.status(StatusCodes.CREATED).json({ ...user._doc });
};

//  To Login
const loginViaOtp = async (req, res) => {
  const { phone } = req.body;

  console.log(phone, "body");

  const user = await User.findOne({ phone: phone });

  console.log(user, "user");

  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: `No User by phone ${phone}` });
  }

  return;

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { email: email, id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );

  user.token = token;
  await user.save();

  res.status(StatusCodes.CREATED).json({ ...user._doc });
};

module.exports = { register, login, loginViaOtp };
