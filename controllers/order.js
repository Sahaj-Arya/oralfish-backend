const Lead = require("../models/Lead");
const Orders = require("../models/Orders");
const { ObjectId } = require("mongodb");
const { generateInvoice } = require("../utils/helperFunctions");
const User = require("../models/User");
const Offer = require("../models/Offer");
const { sendbulkNotification } = require("./notification");

const getOrderByUid = async (req, res) => {
  const { user_id } = req.body;

  try {
    const {
      limit = 10,
      page = 1,
      sortField = "date",
      sortOrder = "asc",
      search = "",
    } = req.query;

    const sortOrderValue = sortOrder === "asc" ? 1 : -1;
    const limitValue = parseInt(limit, 10);
    const skipValue = (parseInt(page, 10) - 1) * limitValue;

    let sortOptions = {};
    if (sortField === "date") {
      sortOptions = { created: sortOrderValue };
    }

    const matchConditions = [];
    if (search) {
      matchConditions.push({
        $or: [
          { "lead_info.name": { $regex: search, $options: "i" } },
          { "lead_info.email": { $regex: search, $options: "i" } },
          { "lead_info.phone": { $regex: search, $options: "i" } },
          { "offer_info.mobile_data.title": { $regex: search, $options: "i" } },
        ],
      });
    }
    if (user_id) {
      matchConditions.push({ user_id: new ObjectId(user_id) });
    }

    const pipeline = [
      {
        $lookup: {
          from: "offers",
          localField: "offer_id",
          foreignField: "_id",
          as: "offer_info",
        },
      },
      {
        $lookup: {
          from: "leads",
          localField: "lead_id",
          foreignField: "_id",
          as: "lead_info",
        },
      },
      {
        $match: matchConditions.length > 0 ? { $and: matchConditions } : {},
      },
      {
        $project: {
          "offer_info._id": 0,
          "lead_info._id": 0,
        },
      },
      {
        $unwind: {
          path: "$offer_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$lead_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: sortOptions,
      },
      {
        $skip: skipValue,
      },
      {
        $limit: limitValue,
      },
    ];

    const orderDocs = await Orders.aggregate(pipeline);

    const totalDocuments = await Orders.countDocuments(
      matchConditions.length > 0 ? { $and: matchConditions } : {}
    );
    const totalPages = Math.ceil(totalDocuments / limitValue);

    if (!orderDocs || orderDocs.length === 0) {
      return res
        .status(200)
        .send({ success: false, message: "No Orders found" });
    }

    const nextPage =
      parseInt(page, 10) < totalPages ? parseInt(page, 10) + 1 : null;

    return res.send({
      data: orderDocs,
      message: "Data Fetched",
      success: true,
      pagination: {
        totalDocuments,
        totalPages,
        currentPage: parseInt(page, 10),
        nextPage,
      },
    });
  } catch (err) {
    return res.status(500).send({ success: false, message: err.message });
  }
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
  // console.log(req.body);
  try {
    const { ids } = req.body;
    let isUser = false;
    let user;
    let order_settlement = [];
    let wallet;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid or empty array of orders" });
    }

    const objectIds = ids.map((id) => new ObjectId(id));

    const orders = await Orders.find({ _id: { $in: objectIds } });

    orders.forEach(async (item, index) => {
      // get user
      // get user bank details and
      // pay using razorpay payment

      if (!isUser) {
        user = await User.findOne({ _id: new ObjectId(item?.user_id) });
        user = user;
        order_settlement = Array.from(user?.order_settlement);
        wallet = user?.wallet;
        isUser = true;
      }
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

      let title = `${offer?._doc?.mobile_data.title} Order Payment Complete`;
      let message = `Hurray your we're pleased to inform you that your final payment for the order ${item?._id} has been completed!`;
      await sendbulkNotification(user.fcm_token, title, message);

      let pdf = await generateInvoice(invoice, `${item?._id}.pdf`);
      console.log("Invoice generated successfully!", pdf);

      await Orders.findOneAndUpdate(
        {
          _id: new ObjectId(item?._id),
        },
        {
          pdf,
          settled: true,
        }
      );

      let filteredArray;
      if (order_settlement?.length > 0) {
        filteredArray = order_settlement?.filter((toFilter) => {
          return toFilter?.toString() !== item?._id?.toString();
        });
        order_settlement = filteredArray;
      }
      wallet = +wallet + +item?.amount;

      if (filteredArray?.length === 0) {
        user.order_settlement = filteredArray;
        user.wallet = wallet;
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
