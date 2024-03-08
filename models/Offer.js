const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  type_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  bank_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  card_type: {
    type: String,
    required: true,
  },
  annual_fees: {
    type: String,
    required: true,
  },
  joining_fees: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  apply_link: {
    type: String,
    required: true,
  },
  desc: {
    eligibility: {
      type: String,
      required: true,
    },
    features: [
      {
        type: String,
        required: true,
      },
    ],
    documents_required: [
      {
        type: String,
        required: true,
      },
    ],
  },
  rank: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
  deleted_at: {
    type: Date,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now, // Automatically set to the current date/time when a new document is created
  },
  updated_at: {
    type: Date,
    default: Date.now, // Automatically set to the current date/time when a document is updated
  },
  bank_name: {
    type: String,
    required: true,
  },
  earning: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Offers", offerSchema, "offers");
