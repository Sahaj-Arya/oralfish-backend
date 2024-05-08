const mongoose = require("mongoose");

const SponsorSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("Sponsors", SponsorSchema, "sponsors");
