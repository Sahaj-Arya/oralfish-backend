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
    invoice_no: {
      type: String,
      default: "",
    },

    requested: {
      type: Boolean,
      default: false,
    },
    online: {
      type: Boolean,
      default: false,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    bank: {
      bank_name: String,
      bank_ifsc: String,
      account_no: String,
      bank_passbook: String,
      cancelled_check: String,
      pan_image_new: String,
      pan_no_new: String,
      beneficiary_name: String,
      default: Boolean,
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

PaymentSchema.pre("save", function (next) {
  this.updated_at = new Date();
  if (!this.created_at) {
    this.created_at = this.updated_at;
  }
  next();
});

module.exports = mongoose.model("Payments", PaymentSchema, "payments");
