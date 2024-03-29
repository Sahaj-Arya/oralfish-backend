const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const WebUsers = require("../models/WebUsers");
const { ObjectId } = require("mongodb");

const getProfile = async (req, res) => {
  const { id } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.send({
        status: "error",
        errors: [
          {
            message: "Invalid user",
            code: StatusCodes.NOT_FOUND,
          },
        ],
        message: "Operation failed",
      });
    }
    return res.send({
      status: "success",
      message: "Operation completed successfully",
      data: user,
    });
  } catch (error) {
    return res.send({
      status: "error",
      errors: [
        {
          message: "User not found",
          code: StatusCodes.NOT_FOUND,
        },
      ],
      message: "Operation failed",
    });
  }
};

const getAllProfiles = async (req, res) => {
  try {
    const users = await User.find({});

    return res.send({
      status: "success",
      message: "Operation completed successfully",
      data: users,
    });
  } catch (error) {
    return res.send({
      status: "error",
      errors: [
        {
          message: "User not found",
          code: StatusCodes.NOT_FOUND,
        },
      ],
      message: "Operation failed",
    });
  }
};

const getProfileWeb = async (req, res) => {
  // console.log(req.user, "user");
  const id = req.body.id;

  const user = await WebUsers.findById(id);
  if (!user) {
    return res.send({ success: false, message: "User not found" });
  }
  return res.send({ data: user, message: "Data Fetched", success: true });
};

const updateProfile = async (req, res) => {
  let data = {};

  const { account_no, bank_ifsc, bank_name } = req.body;
  let obj = { account_no, bank_ifsc, bank_name };

  let step_done = req.body.stepsDone;

  if (req?.files?.length > 0) {
    req?.files?.map((val, i) => {
      // console.log(val, "j");
      let image = process.env.WEB_URL + "/image/" + val.filename;

      if (step_done == 2) {
        data["profile_image"] = image;
      } else if (step_done == 3) {
        data["pan_image"] = image;
      } else if (step_done == 4) {
        if (i === 0) {
          obj["cancelled_check"] = image;
        } else if (i === 1) {
          obj["bank_passbook"] = image;
        }
      }
    });
  }

  if (step_done == 4) {
    const user = await User.findOne({ phone: req.body.phone });
    let bank_details = [...user?.bank_details, obj];
    data = { bank_details };
    data["isProfileComplete"] = req?.body?.isProfileComplete;
  } else {
    data = { ...req.body, ...data };
  }

  // console.log(data);

  try {
    const updatedUser = await User.findOneAndUpdate(
      { phone: req.body.phone },
      { ...data }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }
    // console.log(updatedUser);
    res.status(200).send({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const updateBank = async (req, res) => {
  const {
    account_no,
    bank_ifsc,
    bank_name,
    bank_id,
    id,
    cancelled_check = null,
    bank_passbook = null,
    remove = false,
  } = req.body;

  let obj = { account_no, bank_ifsc, bank_name };
  if (req?.files?.length > 0) {
    req?.files?.map((val, i) => {
      let image = process.env.WEB_URL + "/image/" + val.filename;
      if (i === 0) {
        obj["cancelled_check"] = image;
      } else if (i === 1) {
        obj["bank_passbook"] = image;
      }
    });
  }

  if (!id) {
    return res.status(404).send("Invalid data no id");
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  let d = [];
  let f = [];
  await user?.bank_details?.forEach((e) => {
    let objVal = e;
    if (e._id?.toString() == bank_id?.toString()) {
      if (remove) {
      } else {
        if (account_no) {
          objVal.account_no = account_no;
        }
        if (bank_ifsc) {
          objVal.bank_ifsc = bank_ifsc;
        }
        if (bank_name) {
          objVal.bank_name = bank_name;
        }
        {
          if (cancelled_check) {
            objVal.cancelled_check = cancelled_check;
          } else if (obj?.cancelled_check) {
            objVal.cancelled_check = obj?.cancelled_check;
          }
        }
        {
          if (bank_passbook) {
            objVal.bank_passbook = bank_passbook;
          } else if (obj?.bank_passbook) {
            objVal.bank_passbook = obj?.bank_passbook;
          }
        }
        d.push(objVal);
      }
    } else {
      f.push(e);
    }
  });

  // console.log(d, "d", f, "f");

  if (d[0]?._id) {
    user.bank_details = [...d, ...f];
  } else {
    user.bank_details = [obj, ...f];
  }
  // console.log("b", user.bank_details);

  await user.save();
  res
    .status(StatusCodes.CREATED)
    .json({ message: "Bank detail added successfully", user });
};

const setDefaultBank = async (req, res) => {
  try {
    const { id, bank_id } = req.body;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!Array.isArray(user.bank_details)) {
      return res.status(400).json({ error: "Invalid bank details" });
    }

    const updatedBankDetails = user.bank_details.map((e) => {
      if (e?._id.toString() === bank_id) {
        e.default = true;
      } else {
        e.default = false;
      }
      return e;
    });

    user.bank_details = updatedBankDetails;
    await user.save();

    // console.log(user.bank_details);
    return res
      .status(200)
      .json({ message: "Default bank updated successfully" });
  } catch (error) {
    console.error("Error in setDefaultBank:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  updateBank,
  getProfile,
  updateProfile,
  getProfileWeb,
  getAllProfiles,
  setDefaultBank,
};
