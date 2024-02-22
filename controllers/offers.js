const { ObjectId } = require("mongodb");

const Offer = require("../models/Offer");

const getAllOffers = async (req, res) => {
  const results = await Offer.aggregate([
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
  return res.send({ data: results, message: "Data Fetched", success: true });

  if (!offer_doc) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: offer_doc, message: "Data Fetched", success: true });
};

const getOfferWeb = async (req, res) => {
  const id = ObjectId(req.body.id); // Replace "your_id_here" with the actual ID

  const offer = await Offer.aggregate([
    {
      $match: { _id: id }, // Filter by ID
    },
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
    // Other stages like $project for selecting fields, etc.
  ]);
  if (!offer) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: offer[0], message: "Data Fetched", success: true });
};

const createOffer = async (req, res) => {
  const document = await Offer.create({ ...req.body });

  if (!document) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: document, message: "Data Fetched", success: true });
};

module.exports = { getAllOffers, createOffer, getOfferWeb };
