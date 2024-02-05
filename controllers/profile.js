const { ObjectId } = require("mongodb");
const User = require("../models/User");

const getProfile = async (req, res) => {
  const { id } = req.body;

  const objectId = new ObjectId(id);

  const user = await User.findOne({ _id: objectId });

  if (!user) {
    return res.send({ success: true, message: "User not found" });
  }
  return res.send({ success: true, user });
};

module.exports = { getProfile };
