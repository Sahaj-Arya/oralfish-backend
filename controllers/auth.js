const { BadRequestError } = require("../errors");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const WebUsers = require("../models/WebUsers");

const generateReferralCode = async (length) => {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const checkCode = async () => {
  let res;
  let result;
  while (!res) {
    result = await generateReferralCode(5);
    res = await User.find({ referral_id: result });
  }
  return result;
};

// Register / Signup
const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await WebUsers.findOne({ email });

  if (existingUser) {
    return res.status(401).json({ message: "User exists", success: false });
  }

  const salt = await bcrypt.genSalt(10);
  const encryptedPassword = await bcrypt.hash(password, salt);

  const user = await WebUsers.create({
    name,
    email,
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

  res.status(StatusCodes.CREATED).json({
    message: "User registered successfully",
    success: true,
  });
};

// To Login
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await WebUsers.findOne({ email });
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
      expiresIn: user?.role === "admin" ? "30d" : "7d",
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

  const updateObj = { otp };

  if (fcm_token) {
    if (existingUser && !existingUser?.fcm_token?.includes(fcm_token)) {
      updateObj["fcm_token"] = Array.from(
        new Set([...existingUser?.fcm_token, fcm_token])
      );
    }
  }

  if (existingUser) {
    if (!existingUser?.referral_id) {
      let code = await checkCode();
      updateObj["referral_id"] = code;
    }

    await User.updateOne(
      {
        phone,
      },
      updateObj
    );
  } else {
    const code = await checkCode();
    updateObj["referral_id"] = code;

    await User.create({
      phone,
      ...updateObj,
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

  if (user?.otp !== otp) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: StatusCodes.NOT_FOUND,
      message: `Entered otp is incorect`,
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
  user.fcm_token = Array.from(new Set([...user?.fcm_token, fcm_token]));
  user.token = Array.from(new Set([...user.token, token]));
  user.isPhoneVerified = true;

  await user.save();

  res
    .status(StatusCodes.CREATED)
    .json({ ...user._doc, token, message: "Login successful" });
};

const logout = async (req, res) => {
  const { phone } = req.body;
  const token = req.header("authorization");
  const user = req.user;

  if (user.token.length < 1) {
    // console.log("data");
    return res.status(StatusCodes.CREATED).json({
      message: "Log out successful",
      success: true,
    });
  }

  // Assuming 'token' is an array of tokens in the user document and you want to remove the current token

  const updatedToken = user.token.filter((e) => e !== token);

  try {
    // Update the user document by removing the token
    const updatedUser = await User.findOneAndUpdate(
      { phone },
      { token: updatedToken },
      { new: true } // Return the updated document
    );

    // If the update is successful, send a success response
    if (updatedUser) {
      res.status(200).json({
        // Use 200 for a successful operation, assuming StatusCodes.CREATED is 201 which is not typically used for logout success
        message: "Log out successful",
        success: true,
      });
    } else {
      // If no user was found or updated, send a failure response
      res.status(404).json({
        // Use 404 if no user is found with the given criteria
        message: "User not found",
        success: false,
      });
    }
  } catch (err) {
    // Catch any errors during the update process
    return res.status(500).json({
      // Use 500 for server errors
      message: "Failed to log out",
      success: false,
      error: err.message, // It's often better to send err.message for clarity on the error
    });
  }
};

const tokenVerification = async (req, res) => {
  // console.log(req.user, "gfd");
};

module.exports = {
  register,
  login,
  loginViaOtp,
  verifyOtp,
  logout,
  tokenVerification,
};
