const mongoose = require("mongoose");

const TemplateSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("Template", TemplateSchema, "templates");
