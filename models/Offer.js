const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({}, { strict: false });

// const offerSchema = new mongoose.Schema({
//   type_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//   },
//   title: {
//     type: String,
//     required: true,
//   },
//   bank_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//   },
//   card_type: {
//     type: String,
//     required: true,
//   },

//   image: {
//     type: String,
//     required: false,
//   },
//   apply_link: {
//     type: String,
//     required: true,
//   },
//   desc: {
//     eligibility: {
//       type: String,
//       required: false,
//     },
//     features: [
//       {
//         type: String,
//         required: false,
//       },
//     ],
//     documents_required: [
//       {
//         type: String,
//         required: false,
//       },
//     ],
//   },
//   rank: {
//     type: Number,
//     required: true,
//   },
//   status: {
//     type: Boolean,
//     required: true,
//   },
//   deleted_at: {
//     type: Date,
//     default: null,
//   },
//   created_at: {
//     type: Date,
//     default: Date.now,
//   },
//   updated_at: {
//     type: Date,
//     default: Date.now,
//   },

//   bank_name: {
//     type: String,
//     required: true,
//   },
//   earning: {
//     type: Number,
//     required: true,
//   },
//   // credit card

//   annual_fees: {
//     type: String,
//     required: false,
//   },
//   joining_fees: {
//     type: String,
//     required: false,
//   },

//   // for savings acc
//   interest_rate: {
//     type: String,
//     required: false,
//   },
//   opening_charge: {
//     type: String,
//     required: false,
//   },
//   min_balance: {
//     type: String,
//     required: false,
//   },

//   // loan
//   process_fee: {
//     type: String,
//     required: false,
//   },
//   tenure_range: {
//     type: String,
//     required: false,
//   },
//   interest_range: {
//     type: String,
//     required: false,
//   },
//   loan_type: {
//     type: String,
//     required: false,
//   },
//   // demat
//   demat_fee: { type: String, required: false },
//   exhange: {
//     type: String,
//     required: false,
//   },

//   trading_fee: {
//     type: String,
//     required: false,
//   },

//   //trading
//   min_investment: {
//     type: String,
//     required: false,
//   },
//   return: {
//     type: String,
//     required: false,
//   },
// });

module.exports = mongoose.model("Offers", offerSchema, "offers");
