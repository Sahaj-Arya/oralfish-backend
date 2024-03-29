const mongoose = require("mongoose");

const DeletedUserSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model(
  "DeletedUser",
  DeletedUserSchema,
  "deleted_users"
);
