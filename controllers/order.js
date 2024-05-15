const Lead = require("../models/Lead");
const Orders = require("../models/Orders");
const { ObjectId } = require("mongodb");
const { generateInvoice } = require("../utils/helperFunctions");
const User = require("../models/User");
const Offer = require("../models/Offer");
const { sendbulkNotification } = require("./notification");

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
        .send({ success: false, message: "Invalid or empty array of orders" });
    }

    const objectIds = ids.map((id) => new ObjectId(id));

    const orders = await Orders.aggregate([
      {
        $match: { _id: { $in: objectIds }, status: "approved", settled: false },
      },
      {
        $lookup: {
          from: "offers",
          localField: "offer_id",
          foreignField: "_id",
          as: "offer_details",
        },
      },
      {
        $lookup: {
          from: "users",
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

const approveOrders = async (req, res) => {
  try {
    const { ids } = req.body;
    let isUser = false;
    // let user;
    let order_settlement;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid or empty array of orders" });
    }

    const objectIds = ids.map((id) => new ObjectId(id));

    const orders = await Orders.find({ _id: { $in: objectIds } });

    orders.forEach(async (item) => {
      // get user
      // get user bank details and
      // pay using razorpay payment

      // if (!isUser) {
      let user = await User.findOne({ _id: new ObjectId(item?.user_id) });
      order_settlement = user?.order_settlement;
      isUser = true;
      // }
      const offer = await Offer.findOne({ _id: new ObjectId(item?.offer_id) });

      await Lead.findByIdAndUpdate(
        {
          _id: new ObjectId(item?.lead_id),
        },
        {
          status: "settled",
        }
      );

      let defaultBank = user?.bank_details?.find(
        (bank) => bank.default === true
      );

      const invoice = {
        shipping: {
          name: user?.name,
          email: user?.email,
          address: defaultBank?.bank_name,
          city: "",
          state: "",
          country: "",
          postal_code: user?.pincode,
        },
        items: [
          {
            item: offer?._doc?.mobile_data.title,
            description: "deal",
            quantity: 1,
            amount: item?.amount,
          },
        ],
        subtotal: item?.amount,
        paid: 0,
        invoice_nr: item?._id,
      };

      let title = `${item?.mobile_data?.title} Order Payment Complete`;
      let message = `Hurray your we're pleased to inform you that your final payment for the order ${item?._id} has been completed!`;
      await sendbulkNotification(user.fcm_token, title, message);

      let pdf = await generateInvoice(invoice, `${item?._id}.pdf`);
      // console.log("Invoice generated successfully!", pdf);

      await Orders.findOneAndUpdate(
        {
          _id: new ObjectId(item?._id),
        },
        {
          pdf,
          settled: true,
        }
      );
      if (user?.order_settlement?.length > 0) {
        let filteredArray = user?.order_settlement?.filter(
          (toFilter) => !toFilter?.includes(item?._id)
        );
        user.order_settlement = filteredArray;
        user.wallet = (Number(user?.wallet) + Number(item?.amount))?.toString();
        await user.save();
      }
    });

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

module.exports = { getOrderByUid, getSelectedOrders, approveOrders };
