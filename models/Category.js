const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("Category", CategorySchema, "category");
