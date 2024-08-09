const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    // Other fields go here

    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }
);

offerSchema.pre("save", function (next) {
  const currentDate = new Date();

  // Set the updated_at field to the current date
  this.updated_at = currentDate;

  // If created_at doesn't exist, set it to the current date
  if (!this.created_at) {
    this.created_at = currentDate;
  }

  next();
});

module.exports = mongoose.model("Offers", offerSchema, "offers");
