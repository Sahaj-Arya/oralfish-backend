const mongoose = require("mongoose");

// Access sub-schema for managing permissions
const accessSchema = new mongoose.Schema({
  edit: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
});

const WebUsersSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true }, // Ensure email is unique and required
    token: { type: String, default: "" },
    phone: { type: String, default: null, sparse: true }, // Sparse allows multiple nulls for unique indexes
    // role: {
    //   type: String,
    //   enum: ["admin", "manager", "user"],
    //   default: "manager",
    // }, // Role options
    // profile_image: { type: String, default: "" },
    access: {
      category: { type: accessSchema, default: () => ({}) },
      offer: { type: accessSchema, default: () => ({}) },
      lead: { type: accessSchema, default: () => ({}) },
      payment: { type: accessSchema, default: () => ({}) },
      user: { type: accessSchema, default: () => ({}) },
      notification: { type: accessSchema, default: () => ({}) },
      banner: { type: accessSchema, default: () => ({}) },
      sponsored_ad: { type: accessSchema, default: () => ({}) },
      manager: { type: accessSchema, default: () => ({}) },
    },
  },
  { timestamps: true }
); // Automatically add createdAt and updatedAt fields

module.exports = mongoose.model("WebUsers", WebUsersSchema, "webusers");
