const mongoose = require("mongoose");

const TutorialSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("Tutorial", TutorialSchema, "tutorials");
