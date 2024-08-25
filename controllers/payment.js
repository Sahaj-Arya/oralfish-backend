const { ObjectId } = require("mongodb");
const Payment = require("../models/Payment");
const User = require("../models/User");
const generateInvoiceNew = require("../utils/pdfFunctions");
const { HttpStatusCode } = require("axios");
const { generateOrderId } = require("../utils/specialFunctions");

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
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Set sort order (1 for ascending, -1 for descending)
    const sort = sortOrder === "asc" ? 1 : -1;

    // Create a search query with an optional settled filter
    const searchQuery = {
      ...(search && {
        $or: [
          { "orders.referral_id": { $regex: search, $options: "i" } },
          { "orders.click_id": { $regex: search, $options: "i" } },
          { "orders.offer_id": { $regex: search, $options: "i" } },
          { user_id: { $regex: search, $options: "i" } },
        ],
      }),
      ...(settled !== null && {
        settled: settled === "true", // Convert settled string to boolean
      }),
    };

    // Count total number of payments (before pagination)
    const totalPayments = await Payment.countDocuments(searchQuery);

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalPayments / limitNumber);

    const payments = await Payment.aggregate([
      // Apply the search query with settled filter
      { $match: searchQuery },

      // Unwind the orders array to process each order individually
      { $unwind: "$orders" },

      // Perform a lookup to get the offer details for each order
      {
        $lookup: {
          from: "offers", // The collection name where offers are stored
          localField: "orders.offer_id", // The field in the orders array
          foreignField: "_id", // The field in the offers collection
          as: "orders.offerDetails", // The field to store the populated offer details
        },
      },

      // Convert user_id to ObjectId for the lookup
      {
        $addFields: {
          user_id_obj: { $toObjectId: "$user_id" },
        },
      },

      // Perform a lookup to get the user details
      {
        $lookup: {
          from: "users",
          localField: "user_id_obj",
          foreignField: "_id",
          as: "user_info",
        },
      },

      // Exclude the temporary user_id_obj field
      {
        $project: {
          user_id_obj: 0,
        },
      },

      // Unwind the result to merge offerDetails with each order
      {
        $unwind: {
          path: "$orders.offerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Unwind the user_info array to include user details
      {
        $unwind: {
          path: "$user_info",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Group back to reconstruct the payment document with full order, offer, and user details
      {
        $group: {
          _id: "$_id",
          created_at: { $first: "$created_at" },
          updated_at: { $first: "$updated_at" },
          total: { $first: "$total" },
          requested: { $first: "$requested" },
          settled: { $first: "$settled" },
          user_id: { $first: "$user_id" },
          user_info: { $first: "$user_info" }, // Add user details
          orders: { $push: "$orders" }, // Rebuild orders array with full order and offer details
        },
      },

      // Sort by the specified field and order
      { $sort: { [sortBy]: sort } },

      // Implement pagination by skipping and limiting the results
      { $skip: (pageNumber - 1) * limitNumber },
      { $limit: limitNumber },
    ]);

    return res.status(200).json({
      success: true,
      message:
        "Payments with orders, offers, and user details fetched successfully",
      data: payments,
      pagination: {
        total: totalPayments,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error(
      "Error fetching payments with orders, offers, and user details:",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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

    if (payment?.settled) {
      return res.status(404).json({
        status: false,
        message: "Payment has already been settled",
      });
    }

    let user = await User.findById(payment?.user_id);

    let myBank = null;

    if (user?.bank_details?.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No bank provided by user",
      });
    }
    [user?.bank_details].forEach((bank) => {
      if (bank?.default) {
        myBank = bank;
      }
    });

    if (!myBank) {
      myBank = user?.bank_details[0];
    }

    const { _id, cancelled_check, pan_image_new, ...rest } = myBank?._doc;

    const details = {
      ...rest,
      order_id: payment?._id,
      total: payment?.total,
    };

    return res.status(200).json({ details, message: "", status: true });
  } catch (err) {
    return res
      .status(404)
      .json({ error: err.message, status: false, message: "Error" });
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
};
