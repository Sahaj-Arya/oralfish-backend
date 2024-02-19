const mongoose = require("mongoose");

const BankSchema = new mongoose.Schema(
  {
    bank_name: { type: String, required: true },
    deleted_at: { type: Date, default: null },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Banks", BankSchema, "banks");
