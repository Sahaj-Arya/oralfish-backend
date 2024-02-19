const { BadRequestError } = require("../errors");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const WebUsers = require("../models/WebUsers");
const User = require("../models/User");
const { default: axios } = require("axios");

// Register / Signup
const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await WebUsers.findOne({ email });
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
  const { phone, fcm_token = "" } = req.body;
  const existingUser = await User.findOne({ phone });
  const otp = Math.floor(100000 + Math.random() * 900000);

  // let data = `is ${otp}`;
  // let msg = `Dear user, your mobile verification code ${data}. via-oralfish`;
  // let URL = `http://164.52.195.161/API/SendMsg.aspx?uname=20240015&pass=59s993An&send=OFLOGN&dest=${phone}&msg=${msg}`;
  // let providerOtp = axios.get(URL);
  // providerOtp.then((e) => console.log(e)).catch((err) => console.log(err));

  if (existingUser) {
    await User.updateOne(
      {
        phone,
      },
      { otp, fcm_token }
    );
  } else {
    await User.create({
      phone,
      otp,
      fcm_token,
    });
  }

  return res.status(StatusCodes.CREATED).json({
    message: "OTP sent Successfully",
    data: { validity: "Valid for 5 minutes", otp },
  });
};

const verifyOtp = async (req, res) => {
  const { phone, otp, fcm_token } = req.body;

  const user = await User.findOne({ phone });
  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: `No User by phone ${phone}` });
  }

  if (user.otp !== otp) {
    return res.status(401).json({
      message: "Invalid OTP",
      success: false,
      error: errorMessage,
      code: 401,
    });
  }

  const token = jwt.sign(
    { phone: phone, id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );

  user.otp = "";
  user.fcm_token = fcm_token;
  user.token = token;
  user.isPhoneVerified = true;

  await user.save();

  res.status(StatusCodes.CREATED).json({ ...user._doc });
};

module.exports = { register, login, loginViaOtp, verifyOtp };
