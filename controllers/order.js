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

const getSelectedOrders = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid or empty array of IDs" });
    }

    // Convert ids to ObjectId type if needed
    const objectIds = ids.map((id) => new ObjectId(id));

    const orders = await Orders.aggregate([
      {
        $match: { _id: { $in: objectIds }, status: "approved", settled: false },
      },
      {
        $lookup: {
          from: "offers", // Name of the "offerdetails" collection
          localField: "offer_id",
          foreignField: "_id",
          as: "offer_details",
        },
      },
      {
        $lookup: {
          from: "users", // Name of the "users" collection
          localField: "user_id",
          foreignField: "_id",
          as: "user_details",
        },
      },
    ]);

    if (!orders) {
      return res
        .status(404)
        .send({ success: false, message: "No orders found" });
    }

    return res.send({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

module.exports = { getOrderByUid, getSelectedOrders };
