const { ObjectId } = require("mongodb");
const Payment = require("../models/Payment");
const User = require("../models/User");
const generateInvoiceNew = require("../utils/pdfFunctions");
const { HttpStatusCode } = require("axios");
const { generateOrderId } = require("../utils/specialFunctions");
const Lead = require("../models/Lead");

const createPayment = async (req, res) => {
  const { orders, total, user_id } = req.body;
  const order_id = generateOrderId();

  try {
    const payment = new Payment({
      orders,
      total,
      user_id,
      order_id,
    });

    const user = await User.findOne({ _id: new ObjectId(user_id) });

    user.lead_settlement = [];
    user.wallet = "0";

    await user.save();
    await payment.save();

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "desc",
      search = "",
      settled = null,
      fromDate = null,
      toDate = null,
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const sortOrderValue = sortOrder === "asc" ? 1 : -1;

    // Define match conditions for the query
    const matchConditions = {};

    if (search) {
      matchConditions.$or = [
        { invoice_no: { $regex: search, $options: "i" } },
        { "user_info.refferal_id": { $regex: search, $options: "i" } },
        { "user_info.phone": { $regex: search, $options: "i" } },
        { "user_info.name": { $regex: search, $options: "i" } },
        { _id: { $regex: search, $options: "i" } },
      ];
    }

    if (settled !== null) {
      matchConditions.settled = settled === "true";
    }

    // Add date range filter if fromDate and toDate are provided
    if (fromDate || toDate) {
      matchConditions.created_at = {};
      if (fromDate) {
        matchConditions.created_at.$gte = new Date(fromDate);
      }
      if (toDate) {
        matchConditions.created_at.$lte = new Date(toDate);
      }
    }

    const pipeline = [
      { $unwind: "$orders" },

      {
        $lookup: {
          from: "offers",
          localField: "orders.offer_id",
          foreignField: "_id",
          as: "orders.offerDetails",
        },
      },

      {
        $addFields: {
          user_id_obj: { $toObjectId: "$user_id" },
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
        $project: {
          user_id_obj: 0,
        },
      },

      {
        $unwind: {
          path: "$orders.offerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $unwind: {
          path: "$user_info",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $group: {
          _id: "$_id",
          created_at: { $first: "$created_at" },
          updated_at: { $first: "$updated_at" },
          invoice_no: { $first: "$invoice_no" },
          total: { $first: "$total" },
          requested: { $first: "$requested" },
          settled: { $first: "$settled" },
          online: { $first: "$online" },
          user_id: { $first: "$user_id" },
          user_info: { $first: "$user_info" },
          orders: { $push: "$orders" },
        },
      },
      {
        $match: Object.keys(matchConditions).length > 0 ? matchConditions : {},
      },
    ];

    if (sortBy) {
      pipeline.push({
        $sort: { [sortBy]: sortOrderValue },
      });
    }

    pipeline.push(
      { $skip: (pageNumber - 1) * limitNumber },
      { $limit: limitNumber }
    );

    const countPipeline = [
      ...pipeline,
      {
        $count: "total",
      },
    ];

    const countResult = await Payment.aggregate(countPipeline);
    const payments = await Payment.aggregate(pipeline);

    const totalDocuments = countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalDocuments / limitNumber);
    const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;

    if (!payments || payments.length === 0) {
      return res
        .status(200)
        .send({ success: false, message: "No Payments Found" });
    }

    return res.status(200).send({
      data: payments,
      message:
        "Payments with orders, offers, and user details fetched successfully",
      success: true,
      pagination: {
        totalDocuments,
        totalPages,
        currentPage: pageNumber,
        nextPage,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error(
      "Error fetching payments with orders, offers, and user details:",
      error
    );
    return res.status(500).send({ success: false, message: error.message });
  }
};

const getPaymentMobile = async (req, res) => {
  const { user_id } = req.body;
  try {
    let {
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "desc",
      search = "",
      type,
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const sortOrderValue = sortOrder === "asc" ? 1 : -1;

    const matchConditions = {};

    if (user_id) {
      matchConditions.user_id = new ObjectId(user_id);
    }

    if (search) {
      matchConditions.$or = [
        { invoice_no: { $regex: search, $options: "i" } },
        { user_id: { $regex: search, $options: "i" } },
        { _id: { $regex: search, $options: "i" } },
      ];
    }

    if (type) {
      if (type === "true") {
        matchConditions.settled = true;
      } else {
        matchConditions.settled = false;
      }
    }

    const pipeline = [
      { $unwind: "$orders" },

      {
        $lookup: {
          from: "offers",
          localField: "orders.offer_id",
          foreignField: "_id",
          as: "orders.offerDetails",
        },
      },

      {
        $addFields: {
          user_id_obj: { $toObjectId: "$user_id" },
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
        $project: {
          user_id_obj: 0,
        },
      },

      {
        $unwind: {
          path: "$orders.offerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $unwind: {
          path: "$user_info",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $group: {
          _id: "$_id",
          created_at: { $first: "$created_at" },
          updated_at: { $first: "$updated_at" },
          invoice_no: { $first: "$invoice_no" },
          total: { $first: "$total" },
          requested: { $first: "$requested" },
          settled: { $first: "$settled" },
          online: { $first: "$online" },
          user_id: { $first: "$user_id" },
          user_info: { $first: "$user_info" },
          orders: { $push: "$orders" },
        },
      },
      {
        $match: Object.keys(matchConditions).length > 0 ? matchConditions : {},
      },
    ];

    if (sortBy) {
      pipeline.push({
        $sort: { [sortBy]: sortOrderValue },
      });
    }

    // Count total documents matching the criteria
    const countPipeline = [
      { $match: matchConditions },
      {
        $count: "totalDocuments",
      },
    ];

    const [countResult] = await Payment.aggregate(countPipeline);
    const totalDocuments = countResult ? countResult.totalDocuments : 0;

    // Calculate total pages
    const totalPages = Math.ceil(totalDocuments / limitNumber);

    // Calculate next page
    const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;

    pipeline.push(
      { $skip: (pageNumber - 1) * limitNumber },
      { $limit: limitNumber }
    );

    const payments = await Payment.aggregate(pipeline);

    if (!payments || payments.length === 0) {
      return res
        .status(200)
        .send({ success: false, message: "No Payments Found" });
    }

    return res.status(200).send({
      data: payments,
      message:
        "Payments with orders, offers, and user details fetched successfully",
      success: true,
      pagination: {
        totalDocuments,
        totalPages,
        currentPage: pageNumber,
        nextPage,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error(
      "Error fetching payments with orders, offers, and user details:",
      error
    );
    return res.status(500).send({ success: false, message: error.message });
  }
};

const settlePaymentOffline = async (req, res) => {
  const { id } = req.body;

  try {
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        status: false,
        message: "Invalid Payment",
      });
    }

    if (payment.settled) {
      return res.status(400).json({
        status: false,
        message: "Payment has already been settled",
      });
    }

    const user = await User.findById(payment.user_id);

    if (!user || !user.bank_details || user.bank_details.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No bank details provided by user",
      });
    }

    // Find the default bank account
    let myBank =
      user.bank_details.find((bank) => bank.default) || user.bank_details[0];

    // Settle each order and update the corresponding lead status
    await Promise.all(
      payment.orders.map(async (order) => {
        await Lead.findByIdAndUpdate(order._id, { status: "settled" });
      })
    );

    // Remove sensitive fields before sending the bank details
    const { _id, cancelled_check, pan_image_new, ...rest } = myBank;

    payment.online = true;
    payment.settled = true;
    payment.bank = myBank;

    await payment.save();

    const details = {
      ...rest,
      order_id: payment._id,
      total: payment.total,
    };

    return res
      .status(200)
      .json({ details, message: "Payment settled successfully", status: true });
  } catch (err) {
    console.error("Error settling payment offline:", err);
    return res.status(500).json({
      error: err.message,
      status: false,
      message: "Internal server error",
    });
  }
};

const settlePaymentOnline = async (req, res) => {};

const getPaymentPdf = async (req, res) => {
  await generateInvoiceNew(req.body.data);
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentPdf,
  settlePaymentOffline,
  settlePaymentOnline,
  getPaymentMobile,
};
