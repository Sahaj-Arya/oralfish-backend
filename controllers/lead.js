const Lead = require("../models/Lead");
const { ObjectId } = require("mongodb");

const getAllLeads = async (req, res) => {
  const offer_doc = await Offer.find({});

  const results = await Lead.aggregate([
    {
      $lookup: {
        from: "banks", // The collection to join with
        localField: "bank_id", // ObjectId field in the 'offer' collection
        foreignField: "_id", // ObjectId _id field in the 'bank' collection
        as: "bank_info", // Output array field for joined bank documents
      },
    },
    {
      $lookup: {
        from: "category", // The collection to join with
        localField: "type_id", // ObjectId field in the 'offer' collection
        foreignField: "_id", // ObjectId _id field in the 'category' collection
        as: "category_info", // Output array field for joined category documents
      },
    },
    {
      $unwind: {
        path: "$bank_info",
        preserveNullAndEmptyArrays: true, // Optional: Keeps documents that do not match the lookup
      },
    },
    {
      $unwind: {
        path: "$category_info",
        preserveNullAndEmptyArrays: true, // Optional: Keeps documents that do not match the lookup
      },
    },
    // Other stages like $match for filtering, $project for selecting fields, etc.
  ]);

  // console.log(results);

  if (!offer_doc) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: results, message: "Data Fetched", success: true });
};

const CreateLead = async (req, res) => {
  const createdUser = await Lead.create({ ...req });
  createdUser
    .then((data) => {
      return res.send({ data, message: "Data Fetched", success: true });
    })
    .catch((err) => {
      return res.send({ success: false, message: "failed", err });
    });
};

module.exports = { getAllLeads, CreateLead };
