const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

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
  const id = req.body.id; // Replace "your_id_here" with the actual ID

  const offer = await User.findById(id);
  if (!offer) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: offer[0], message: "Data Fetched", success: true });
};

const updateProfile = async (req, res) => {
  // const { phone, email, name, pan_no, dob } = req.body;
  // console.log(req.files, "image", req.body);

  let data = {};

  const { account_no, bank_ifsc, bank_name } = req.body;
  let obj = { account_no, bank_ifsc, bank_name };

  let step_done = req.body.stepsDone;
  if (req?.files?.length > 0) {
    req?.files?.map((val, i) => {
      console.log(val, "j");
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

  console.log(data);

  try {
    const updatedUser = await User.findOneAndUpdate(
      { phone: req.body.phone },
      { ...data }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

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

module.exports = {
  updateBank,
  getProfile,
  updateProfile,
  getProfileWeb,
  getAllProfiles,
};
