const Orders = require("../models/Orders");
const { ObjectId } = require("mongodb");

const getOrderByUid = async (req, res) => {
  const { user_id } = req.body;
  const uid = new ObjectId(user_id);
  const result = await Orders.find({ user_id: uid });
//   console.log(result);

  if (!result) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ success: true, message: "Successfull", result });
};
module.exports = { getOrderByUid };
