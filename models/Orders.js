const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    status: { type: String, required: false },
    settled: { type: Boolean, required: false },
    offer_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    referral_id: { type: String, required: true },
    pdf: { type: String, value: "" },
    click_id: { type: String, required: true },
    redeemed: { type: String, required: false },
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    lead_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: {
      createdAt: "created",
      updatedAt: "updated",
    },
  }
);

module.exports = mongoose.model("Orders", OrderSchema, "orders");
