const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const WebUsers = require("../models/WebUsers");
const { ObjectId } = require("mongodb");
const Template = require("../models/Template");
const {
  sendNotification,
  saveNotification,
  saveNotificationfn,
} = require("./notification");

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
    const {
      limit = 10,
      page = 1,
      sortField = "created",
      sortOrder = "desc",
      search = "",
      fromDate,
      toDate,
      type = "",
    } = req.query;

    const sortOrderValue = sortOrder === "desc" ? -1 : 1;
    const limitValue = parseInt(limit, 10);
    const skipValue = (parseInt(page, 10) - 1) * limitValue;

    let sortOptions = {};
    // if (sortField) {
    //   sortOptions[sortField] = sortOrderValue;
    // }

    const matchConditions = [];
    // console.log(req.query.type);
    if (search && type) {
      matchConditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { referral_id: { $regex: search, $options: "i" } },
          {
            profile_status: { $regex: type, $options: "i" },
          },
        ],
      });
    } else {
      if (search) {
        matchConditions.push({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { referral_id: { $regex: search, $options: "i" } },
          ],
        });
      }

      if (type) {
        matchConditions.push({
          profile_status: { $regex: type, $options: "i" },
        });
      }
    }

    if (fromDate && toDate) {
      matchConditions.push({
        created: {
          $gte: new Date(fromDate),
          $lte: new Date(toDate),
        },
      });
    }

    const matchQuery =
      matchConditions.length > 0 ? { $and: matchConditions } : {};

    const users = await User.find(matchQuery)
      .sort(sortOptions)
      .skip(skipValue)
      .limit(limitValue);

    const totalDocuments = await User.countDocuments(matchQuery);
    const totalPages = Math.ceil(totalDocuments / limitValue);

    if (!users || users.length === 0) {
      return res.status(200).send({
        success: false,
        message: "No users found",
      });
    }

    const nextPage =
      parseInt(page, 10) < totalPages ? parseInt(page, 10) + 1 : null;

    return res.send({
      status: "success",
      message: "Operation completed successfully",
      data: users,
      pagination: {
        totalDocuments,
        totalPages,
        currentPage: parseInt(page, 10),
        nextPage,
      },
    });
  } catch (error) {
    return res.send({
      status: "error",
      errors: [
        {
          message: error.message || "An error occurred",
          code: 500,
        },
      ],
      message: "Operation failed",
    });
  }
};

const getAllWebProfiles = async (req, res) => {
  try {
    const { limit = 10, page = 1, search = "" } = req.query;

    const limitValue = parseInt(limit, 10);
    const skipValue = (parseInt(page, 10) - 1) * limitValue;

    const matchConditions = [];
    console.log(req.query.type);

    if (search) {
      matchConditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      });
    }

    const matchQuery =
      matchConditions.length > 0 ? { $and: matchConditions } : {};

    const users = await WebUsers.find(matchQuery)
      .skip(skipValue)
      .limit(limitValue);

    const totalDocuments = await User.countDocuments(matchQuery);
    const totalPages = Math.ceil(totalDocuments / limitValue);

    if (!users || users.length === 0) {
      return res.status(200).send({
        success: false,
        message: "No users found",
      });
    }

    const nextPage =
      parseInt(page, 10) < totalPages ? parseInt(page, 10) + 1 : null;

    return res.send({
      status: "success",
      message: "Operation completed successfully",
      data: users,
      pagination: {
        totalDocuments,
        totalPages,
        currentPage: parseInt(page, 10),
        nextPage,
      },
    });
  } catch (error) {
    console.log(error);

    return res.send({
      status: "error",
      errors: [
        {
          message: error.message || "An error occurred",
          code: 500,
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
  const { account_no, bank_ifsc, bank_name, pan_no, pan_no_new } = req.body;
  let obj = { account_no, bank_ifsc, bank_name, pan_no, pan_no_new };

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
        } else if (i === 2) {
          obj["pan_image_new"] = image;
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

const updateNameEmail = async (req, res) => {
  if (!req.body.phone) {
    return res.status(404).send("User Not found");
  }
  await User.findOneAndUpdate(
    { phone: req.body.phone },
    { email: req.body.email, name: req.body.name }
  )
    .then((result) => {
      res.status(200).send({
        message: "User updated successfully",
        status: true,
        data: result,
      });
    })
    .catch((err) => {
      res.status(404).send({ message: "Failed to update", status: false });
    });
};

const updateBank = async (req, res) => {
  try {
    const { id, _id, remove, ...rest } = req.body;

    // Validate user ID
    if (!id) {
      return res.status(400).send("Invalid data: no user id provided");
    }

    // Fetch the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare the update query
    let updateQuery = {};
    let options = { new: true }; // Return the updated document

    // If no _id is provided, add a new bank detail
    if (!_id) {
      const newBank = { ...rest };

      // Mark the first added bank as default if none exists
      if (user.bank_details.length === 0) {
        newBank.default = true;
      }

      // Use $push to add the new bank detail
      updateQuery = { $push: { bank_details: newBank } };
    }
    // If remove is true and _id is provided, remove the bank detail by _id
    else if (remove && _id) {
      // Use $pull to remove the bank detail from the array
      updateQuery = { $pull: { bank_details: { _id } } };
    }
    // Otherwise, update an existing bank detail by _id
    else if (_id) {
      // Find the existing bank detail with the provided _id
      const bankToUpdate = user.bank_details.find(
        (bank) => bank._id.toString() === _id
      );

      if (!bankToUpdate) {
        return res.status(404).json({ message: "Bank detail not found" });
      }

      // Check if any field is actually different before updating
      const fieldsToUpdate = {};
      let hasChanges = false;

      for (const key in rest) {
        if (rest[key] !== bankToUpdate[key]) {
          fieldsToUpdate[`bank_details.$[bank].${key}`] = rest[key];
          hasChanges = true;
        }
      }

      // If no changes, skip the update
      if (!hasChanges) {
        return res.status(200).json({ message: "No changes detected", user });
      }

      // Use $set to update the specific fields of the matching bank detail
      updateQuery = {
        $set: fieldsToUpdate,
      };

      // Use arrayFilters to target the correct bank detail based on _id
      options.arrayFilters = [{ "bank._id": _id }];
    }

    // Also update the profile verification and status
    updateQuery.$set = {
      ...updateQuery.$set, // Keep the existing $set fields
      isProfileVerified: false,
      profile_status:
        user.profile_status !== "rejected" ? "updated" : user.profile_status,
    };

    // Perform the update operation on the user document
    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      updateQuery,
      options
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "User not found or no changes made" });
    }

    // Return the updated user document
    return res
      .status(200)
      .json({ message: "Bank detail updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
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

const ApproveProfile = async (req, res) => {
  const { id, value } = req.body;
  console.log(req.body);

  let isProfileVerified = false;
  if (value === "approved") {
    isProfileVerified = true;
    profile_status = "approved";
  } else {
    isProfileVerified = false;
    profile_status = "rejected";
  }
  try {
    const user = await User.findByIdAndUpdate(id, {
      isProfileVerified,
      profile_status,
    });
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

    if (!isProfileVerified) {
      const noti = await Template.findById("66add7c3f823a734864c1b01");
      await sendNotification({
        ...noti?._doc,
        tokens: user?.fcm_token,
        route: "Profile",
        route_id: "",
        user_id: id,
      });

      return res.send({
        status: "success",
        message: user?.name + " rejected",
        data: user,
      });
    }

    const noti = await Template.findById("66add80ff823a734864c1b04");
    // console.log({ ...noti?._doc });
    await sendNotification({
      ...noti?._doc,
      tokens: user?.fcm_token,
      route: "Profile",
      route_id: "",
      user_id: id,
    });

    return res.send({
      status: "success",
      message: user?.name + " approved successfully",
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

const RedeemWallet = async (req, res) => {
  const { id } = req.body;
  // console.log(id);
  try {
    const user = await User.findByIdAndUpdate(id, {
      payment_request: true,
      lead_settlement: [],
    });
    // console.log(user);

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
      message: "Redeem Request Sent",
      // data: user,
    });
  } catch (error) {
    return res.send({
      status: "error",
      errors: [
        {
          message: "User Not Found",
          code: StatusCodes.NOT_FOUND,
        },
      ],
      message: "Operation failed",
    });
  }
};

module.exports = {
  updateBank,
  getProfile,
  updateProfile,
  getProfileWeb,
  getAllProfiles,
  setDefaultBank,
  ApproveProfile,
  RedeemWallet,
  updateNameEmail,
  getAllWebProfiles,
};
