const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    offer_id: { type: String, default: "" },
    user_id: { type: String, default: "" },
    bank_id: { type: String, default: "" },
    category_id: { type: String, default: "" },
    click_id: { type: String, default: "" },
    customer_url: { type: String, default: "" },
    apply_link: { type: String, default: "" },
    first_name: { type: String, default: "" },
    last_name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    earning: { type: String, default: null },
    settled: { type: Boolean, default: false },
    isComplete: { type: Boolean, default: false },
    link_with_click_id: { type: String, default: "" },
    sub_id: { type: String, default: "" },
  },
  {
    timestamps: {
      createdAt: "created",
      updatedAt: "updated",
    },
  }
);

module.exports = mongoose.model("Lead", LeadSchema, "leads");
