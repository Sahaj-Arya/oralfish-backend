const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    offer_id: { type: String, default: "" },
    user_id: { type: String, default: "" },
    category_id: { type: String, default: "" },
    click_id: { type: String, default: "" },
    customer_url: { type: String, default: "" },
    apply_link: { type: String, default: "" },
    status: { type: String, default: "" },
    isComplete: { type: String, default: "" },
    remarks: { type: String, default: "" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    earning: { type: String, default: null },
    link_with_click_id: { type: String, default: "" },
    affiliate_id: { type: String, required: true },
  },
  {
    timestamps: {
      createdAt: "created",
      updatedAt: "updated",
    },
  }
);

module.exports = mongoose.model("Lead", LeadSchema, "leads");
