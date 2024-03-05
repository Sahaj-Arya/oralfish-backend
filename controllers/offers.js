const { ObjectId } = require("mongodb");

const Offer = require("../models/Offer");
const { StatusCodes } = require("http-status-codes");

const getAllOffers = async (req, res) => {
  const offer_doc = await Offer.aggregate([
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

  if (!offer_doc) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: offer_doc, message: "Data Fetched", success: true });
};

const getOfferWeb = async (req, res) => {
  const id = ObjectId(req.body.id);

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
  let { desc, type_id, bank_id, ...rest } = req.body;

  type_id = new ObjectId(type_id);
  bank_id = new ObjectId(bank_id);

  desc.benefits = desc.benefits.split(",");
  desc.documents = desc.documents.split(",");

  let image;
  if (req?.files?.length > 0) {
    req?.files?.map((val, i) => {
      let image = process.env.WEB_URL + "/image/" + val.filename;
      rest.image = image;
    });
  }
  // console.log({ desc, ...rest });
  const document = await Offer.create({ desc, ...rest, bank_id, type_id });

  if (!document) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: document, message: "Offer Created", success: true });
};

const getOfferById = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Id cannot be empty", success: false });
  }

  const result = await Offer.findById(id);
  if (!result) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: `No Data Found by &{id}`, success: false });
  }
  return res
    .status(StatusCodes.ACCEPTED)
    .json({ message: `Data found`, success: true, data: result });
};

module.exports = { getAllOffers, createOffer, getOfferWeb, getOfferById };
