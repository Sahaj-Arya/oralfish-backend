const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    rejected: { type: Boolean, required: false },
    pending: { type: Boolean, required: false },
    settled: { type: Boolean, required: false },
    offer_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    referral_id: { type: String, required: true },
    click_id: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: {
      createdAt: "created",
      updatedAt: "updated",
    },
  }
);

module.exports = mongoose.model("Orders", OrderSchema, "orders");
