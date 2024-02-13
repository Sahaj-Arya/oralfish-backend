const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("Offers", OfferSchema, "offers");
