const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
    orders: {
      type: Array,
      default: [],
    },
    total: {
      type: String,
      default: "0",
    },
    settled: {
      type: Boolean,
      default: false,
    },
    requested: { type: Boolean, default: false },
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { strict: false }
);

PaymentSchema.pre("save", function (next) {
  const currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at) {
    this.created_at = currentDate;
  }

  next();
});

module.exports = mongoose.model("Payments", PaymentSchema, "payments");
