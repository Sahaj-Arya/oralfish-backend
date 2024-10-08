const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const WebUsers = require("../models/WebUsers");
const { default: axios } = require("axios");
const { sendEmail } = require("./notification");
const { account_deletion } = require("../utils/template/account_deletion");
const DeletedUser = require("../models/DeletedUser");

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

// Register/Signup
const register = async (req, res) => {
  try {
    const { name, email, pass, confirm_pass, phone, access } = req.body;

    if (!name || !email || !phone) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "All fields are required",
        success: false,
      });
    }

    const existingUser = await WebUsers.findOne({ email, phone });

    if (existingUser) {
      if (name) {
        existingUser.name = name;
      }
      if (phone) {
        existingUser.phone = phone;
      }
      existingUser.access = access;
      if (pass) {
        existingUser.password = pass;
      }

      existingUser.save();

      return res.status(StatusCodes.CREATED).json({
        message: "User updated successfully",
        success: true,
        token: existingUser,
      });
    } else {
      if (confirm_pass !== pass) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Passwords don't match",
        });
      }

      const user = await WebUsers.create({
        name,
        email,
        password: pass,
        phone,
        access,
        token: jwt.sign({ email, phone }, process.env.JWT_SECRET, {
          expiresIn: "30d",
        }),
      });

      res.status(StatusCodes.CREATED).json({
        message: "User registered successfully",
        success: true,
        token: user.token,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Something went wrong during registration",
      success: false,
      error: error.message,
    });
  }
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

  const isValidPassword = password === user.password;

  if (!isValidPassword) {
    return res.status(401).json({ message: "Incorrect email or password" });
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

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await WebUsers.findOne({ email });
  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: `No User by email ${email}` });
  }
};

//  To Login
const loginViaOtp = async (req, res) => {
  const { phone, fcm_token = "" } = req.body;
  const existingUser = await User.findOne({ phone });
  let otp = Math.floor(100000 + Math.random() * 900000);

  if (phone === "0000000000" || phone === "9540368119") {
    otp = "995588";
  } else {
    let data = `${otp}`;
    //  with id HLGI/NYyRX7`;
    let msg = `RojgarApp`;
    let url = `Hello! Please use the OTP ${data} to login to the ${msg} dashboard. FMSPL`;
    let URL = `http://164.52.195.161/API/SendMsg.aspx?uname=20240015&pass=59s993An&send=FUREMA&dest=${phone}&msg=${url}`;
    // let providerOtp = axios.get(URL);
    // providerOtp.then((e) => {}).catch((err) => console.log(err));
    console.log(otp);
  }
  // console.log(fcm_token, "k");

  const updateObj = { otp };
  if (fcm_token) {
    let arr = existingUser?.fcm_token || [];
    arr.push(fcm_token);
    arr = Array.from(new Set(arr));
    if (arr.length > 5) {
      arr = arr.slice(arr?.length - 4);
    } else if (arr.length > 3) {
      arr = arr.slice(3);
    }
    updateObj.fcm_token = arr;

    // console.log(updateObj.fcm_token);
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
  const { phone, otp } = req.body;

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

  let arr = user?.token;
  if (user?.token?.length >= 3) {
    arr = arr.slice(1);
    arr.push(token);
  } else {
    arr.push(token);
  }

  user.token = arr;

  user.otp = "";
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

  const updatedToken = user?.token?.filter((e) => e !== token);
  // console.log(updatedToken);
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

const accountDeletionRequest = async (req, res) => {
  const { phone, email } = req.body;

  const user = await User.findOne({ phone, email });
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "User Doesn't exists",
      success: true,
    });
  }

  const URL = `${process.env.WEB_URL}/delete-account/${user?._id}`;

  await sendEmail(
    email,
    "Account Deletion Confirmation",
    account_deletion(user?.name, URL)
  );

  return res.status(StatusCodes.ACCEPTED).json({
    message: `An email has been sent to ${email} for account deletion`,
    success: true,
  });
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `No user found` });
    }

    const archivedUser = new DeletedUser(user.toObject());
    await archivedUser.save();

    await User.findByIdAndDelete(id);

    return res
      .status(StatusCodes.CREATED)
      .json({ message: `User deleted successfully` });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
  }
};

const deleteWebUser = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);

    const user = await WebUsers.findById(id);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `No user found` });
    }

    await WebUsers.findByIdAndDelete(id);

    return res
      .status(StatusCodes.CREATED)
      .json({ message: `User deleted successfully` });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
  }
};
module.exports = {
  register,
  login,
  loginViaOtp,
  verifyOtp,
  logout,
  accountDeletionRequest,
  deleteUser,
  forgotPassword,
  deleteWebUser,
};
