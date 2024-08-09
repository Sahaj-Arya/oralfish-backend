const Lead = require("../models/Lead");
const Orders = require("../models/Orders");
const { ObjectId } = require("mongodb");
const { generateInvoice } = require("../utils/helperFunctions");
const User = require("../models/User");
const Offer = require("../models/Offer");
const { sendbulkNotification } = require("./notification");
const moment = require("moment");

const getOrderByUid = async (req, res) => {
  const { user_id } = req.body;

  try {
    const {
      limit = 10,
      page = 1,
      sortField = "date",
      sortOrder = "desc",
      search = "",
      type = "1",
      fromDate,
      toDate,
      lead = "true",
    } = req.query;

    const sortOrderValue = sortOrder === "desc" ? 1 : -1;
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

    if (fromDate && toDate) {
      matchConditions.push({
        created: {
          $gte: moment(fromDate, "YYYY/MM/DD").toDate(),
          $lte: moment(toDate, "YYYY/MM/DD").toDate(),
        },
      });
    }

    if (type) {
      switch (type) {
        case "2":
          matchConditions.push({
            settled: false,
          });
          break;
        case "3":
          matchConditions.push({
            settled: true,
          });
          break;
        case "4":
          matchConditions.push({
            settled: true,
            redeemed: true,
          });
          break;
        default:
          break;
      }
    }
    if (user_id) {
      matchConditions.push({ user_id: new ObjectId(user_id) });
    }

    let pipeline = [
      {
        $lookup: {
          from: "offers",
          localField: "offer_id",
          foreignField: "_id",
          as: "offer_info",
        },
      },

      {
        $unwind: {
          path: "$offer_info",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (lead === "true") {
      pipeline.push({
        $lookup: {
          from: "leads",
          localField: "lead_id",
          foreignField: "_id",
          as: "lead_info",
        },
      });
      pipeline.push({
        $unwind: {
          path: "$lead_info",
          preserveNullAndEmptyArrays: true,
        },
      });
    }

    pipeline.push(
      {
        $project: {
          "offer_info._id": 0,
          "lead_info._id": 0,
        },
      },
      {
        $match: matchConditions.length > 0 ? { $and: matchConditions } : {},
      },
      {
        $sort: sortOptions,
      },
      {
        $skip: skipValue,
      },
      {
        $limit: limitValue,
      }
    );

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
const downloadAllOrders = async (req, res) => {
  try {
    const {
      sortField = "date",
      sortOrder = "asc",
      search = "",
      fromDate,
      toDate,
      type,
    } = req.query;
    console.log(req.query, "h");
    const sortOrderValue = sortOrder === "asc" ? 1 : -1;

    const matchConditions = {};
    if (search) {
      matchConditions.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { "offer_info.mobile_data.title": { $regex: search, $options: "i" } },
      ];
    }

    // if (type && matchConditions?.$or) {
    //   matchConditions.$or.push({
    //     "offer_info._id": new ObjectId(type),
    //   });
    // } else if (type && !matchConditions?.$or) {
    //   matchConditions.$or = [
    //     {
    //       "offer_info._id": new ObjectId(type),
    //     },
    //   ];
    // }

    if (fromDate && toDate) {
      matchConditions.created = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    const pipeline = [
      {
        $addFields: {
          user_id_obj: { $toObjectId: "$user_id" },
          offer_id_obj: { $toObjectId: "$offer_id" },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "user_id_obj",
          foreignField: "_id",
          as: "user_info",
        },
      },
      {
        $lookup: {
          from: "offers",
          localField: "offer_id_obj",
          foreignField: "_id",
          as: "offer_info",
        },
      },

      {
        $unwind: {
          path: "$user_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$offer_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: Object.keys(matchConditions).length > 0 ? matchConditions : {},
      },
    ];

    if (sortField) {
      pipeline.push({
        $sort: sortField === "date" ? { created: sortOrderValue } : {},
      });
    }
    const countPipeline = [
      ...pipeline,
      {
        $count: "total",
      },
    ];

    const countResult = await Orders.aggregate(countPipeline);

    const lead_doc = await Orders.aggregate(pipeline);

    const totalDocuments = countResult.length > 0 ? countResult[0].total : 0;

    if (!lead_doc || lead_doc.length === 0) {
      return res
        .status(200)
        .send({ success: false, message: "No Orders Found" });
    }

    return res.send({
      data: lead_doc,
      message: "Data Fetched",
      success: true,
      pagination: {
        totalDocuments,
      },
    });
  } catch (err) {
    return res.status(500).send({ success: false, message: err.message });
  }
};
const approveOrders = async (req, res) => {
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

module.exports = {
  getOrderByUid,
  getSelectedOrders,
  approveOrders,
  downloadAllOrders,
};
