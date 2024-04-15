const mongoose = require("mongoose");

const DeletedDataSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model(
  "DeletedData",
  DeletedDataSchema,
  "deleted_data"
);
