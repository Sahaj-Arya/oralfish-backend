const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("Banners", BannerSchema, "banners");
