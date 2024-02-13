const { ObjectId } = require("mongodb");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

const getProfile = async (req, res) => {
  const { id } = req.body;

  const objectId = new ObjectId(id);

  const user = await User.findOne({ _id: objectId });

  if (!user) {
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
  return res.send({
    status: "success",
    message: "Operation completed successfully",
    user,
  });
};

module.exports = { getProfile };
