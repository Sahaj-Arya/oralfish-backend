const Payment = require("../models/Payment");

const createPayment = async (req, res) => {
  const { orders, total, user_id } = req.body;

  try {
    const payment = new Payment({
      orders,
      total,
      user_id,
    });

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
    const payments = await Payment.aggregate([
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

      // Unwind the result to merge offerDetails with each order
      {
        $unwind: {
          path: "$orders.offerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Group back to reconstruct the payment document with full order and offer details
      {
        $group: {
          _id: "$_id",
          created_at: { $first: "$created_at" },
          updated_at: { $first: "$updated_at" },
          total: { $first: "$total" },
          settled: { $first: "$settled" },
          user_id: { $first: "$user_id" },
          orders: { $push: "$orders" }, // Rebuild orders array with full order and offer details
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Payments with orders and offers fetched successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching payments with orders and offers:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { createPayment, getPayments };
