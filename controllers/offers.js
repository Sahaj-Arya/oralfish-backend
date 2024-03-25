const { ObjectId } = require("mongodb");
const { StatusCodes } = require("http-status-codes");

const Offer = require("../models/Offer");

const getAllOffers = async (req, res) => {
  const offer_doc = await Offer.aggregate([
    {
      $match: {
        status: true,
      },
    },
    {
      $lookup: {
        from: "banks",
        localField: "bank_id",
        foreignField: "_id",
        as: "bank_info",
      },
    },
    {
      $lookup: {
        from: "category",
        localField: "type_id",
        foreignField: "_id",
        as: "category_info",
      },
    },
    {
      $unwind: {
        path: "$bank_info",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$category_info",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  if (!offer_doc) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: offer_doc, message: "Data Fetched", success: true });
};

const getAllOffersWeb = async (req, res) => {
  const offer_doc = await Offer.aggregate([
    {
      $lookup: {
        from: "banks",
        localField: "bank_id",
        foreignField: "_id",
        as: "bank_info",
      },
    },
    {
      $lookup: {
        from: "category",
        localField: "type_id",
        foreignField: "_id",
        as: "category_info",
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

const getSelectedOffersWeb = async (req, res) => {
  const id = ObjectId(req.body.id);

  const DATA = [
    {
      $lookup: {
        from: "banks",
        localField: "bank_id",
        foreignField: "_id",
        as: "bank_info",
      },
    },
    {
      $lookup: {
        from: "category",
        localField: "type_id",
        foreignField: "_id",
        as: "category_info",
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
  ];

  if (req.body.id != "65d84d29c5f6515b756a3704") {
    DATA.push({ $match: { type_id: id, status: true } });
  }
  const offer_doc = await Offer.aggregate(DATA);

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

  if (desc?.features) {
    desc.features = desc.features.split("\r\n"); // Modify desc.features to be an array
  }
  if (desc?.documents_required) {
    desc.documents_required = desc.documents_required.split("\r\n");
  }

  if (req?.files?.length > 0) {
    req?.files?.map((val, i) => {
      let image = process.env.WEB_URL + "/image/" + val.filename;
      rest.image = image;
    });
  }

  const document = await Offer.create({ desc, ...rest, bank_id, type_id });

  if (!document) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: document, message: "Offer Created", success: true });
};

const updateOffer = async (req, res) => {
  let { desc, id, bank_id, ...rest } = req.body;
  let data = {};

  bank_id = new ObjectId(bank_id);

  if (desc?.features) {
    desc.features = desc.features.split("\r\n");
  }
  if (desc?.documents_required) {
    desc.documents_required = desc.documents_required.split("\r\n");
  }

  if (req?.files?.length > 0) {
    req?.files?.map((val, i) => {
      let image = process.env.WEB_URL + "/image/" + val.filename;
      rest.image = image;
    });
  }

  const document = await Offer.findOneAndUpdate(
    { _id: id },
    {
      desc,
      ...rest,
      bank_id,
    }
  );

  if (!document) {
    return res.send({ success: false, message: "failed" });
  }

  return res.send({ data: document, message: "Offer Updated", success: true });
};

const updateRank = async (req, res) => {
  const { id, new_rank } = req.body;

  const result = await Offer.findById(id);

  if (!result) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send({ success: false, message: "Document not found" });
  }

  const currentRank = result.rank;
  result.rank = new_rank;

  await result.save();
  return res
    .status(StatusCodes.CREATED)
    .send({ success: true, message: "Updated successfully" });

  // const update = await Offer.updateMany(
  //   { rank: { $gt: currentRank } },
  //   { $inc: { rank: 1 } }
  // );
  // if (update) {
  //   return res
  //     .status(StatusCodes.CREATED)
  //     .send({ success: true, message: "Updated successfully", update });
  // }
  // } catch (error) {
  //   console.error("Error updating rank:", error);
  //   return res
  //     .status(StatusCodes.INTERNAL_SERVER_ERROR)
  //     .send({ success: false, message: "Failed to update rank" });
  // }
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

const updateOfferStatus = async (req, res) => {
  const { id, status } = req.body;

  const offer = await Offer.findByIdAndUpdate(id, { status });
  if (!offer) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Offer does not exists", success: false });
  }
  return res
    .status(StatusCodes.ACCEPTED)
    .json({ message: `Offer Status Updated `, success: true, offer });
};

module.exports = {
  getAllOffers,
  createOffer,
  getOfferWeb,
  getOfferById,
  updateOffer,
  updateRank,
  updateOfferStatus,
  getAllOffersWeb,
  getSelectedOffersWeb,
};
