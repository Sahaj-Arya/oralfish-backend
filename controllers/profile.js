const { ObjectId } = require("mongodb");
const User = require("../models/User");
// const Users = require("../models/Users");
const { StatusCodes } = require("http-status-codes");

const getProfile = async (req, res) => {
  const { id } = req.body;

  try {
    const objectId = new ObjectId(id);
    const user = await User.findOne({ _id: objectId });
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
      let image = "http://192.168.1.8:5001/image/" + val.filename;

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
    if (step_done == 4) {
      const user = await User.findOne({ phone: req.body.phone });

      let bank_details = [...user?.bank_details, obj];
      data = { bank_details };
      data["isProfileComplete"] = req?.body?.isProfileComplete;
    } else {
      data = { ...req.body, ...data };
    }
  } else {
    return res.status(404).send("Image cannot be empty");
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

    res.status(200).send({ message: "User updated successfully", updatedUser });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = { getProfile, updateProfile };
