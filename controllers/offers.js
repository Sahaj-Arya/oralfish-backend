const { ObjectId } = require("mongodb");
const { StatusCodes } = require("http-status-codes");

const Offer = require("../models/Offer");
const DeletedData = require("../models/DeletedData");

const getAllOffers = async (req, res) => {
  const offer_doc = await Offer.aggregate([
    {
      $match: {
        status: true,
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
        from: "category",
        localField: "type_id",
        foreignField: "_id",
        as: "category_info",
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
  try {
    const id = new ObjectId(req.body.id);

    const DATA = [
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
          path: "$category_info",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (req.body.id !== "6617742141652c98b6277bb8") {
      if (req.body.status) {
        DATA.push({ $match: { type_id: id, status: true } });
      } else {
        DATA.push({ $match: { type_id: id } });
      }
    } else {
      if (req.body.status) {
        DATA.push({ $match: { status: true } });
      }
    }

    const offer_doc = await Offer.aggregate(DATA);

    if (!offer_doc) {
      return res
        .status(404)
        .json({ success: false, message: "Data not found" });
    }

    return res
      .status(200)
      .json({ data: offer_doc, message: "Data Fetched", success: true });
  } catch (error) {
    console.error("Error in fetching offers:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getOfferWeb = async (req, res) => {
  const id = new ObjectId(req.body.id);

  const offer = await Offer.aggregate([
    {
      $match: { _id: id }, // Filter by ID
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
        path: "$category_info",
        preserveNullAndEmptyArrays: true, // Optional: Keeps documents that do not match the lookup
      },
    },
  ]);
  if (!offer) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: offer[0], message: "Data Fetched", success: true });
};

const createOffer = async (req, res) => {
  let { type_id, offer_data, ...rest } = req.body;

  type_id = new ObjectId(type_id);

  let arr = [];
  offer_data?.forEach((item) => {
    if (item.value?.includes("\n")) {
      item.value = item?.value?.split("\n");
      arr.push(item);
      return;
    }
    arr.push(item);
  });
  // console.log(arr);
  const document = await Offer.create({
    ...rest,
    type_id,
    offer_data: arr,
  });

  if (!document) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: document, message: "Offer Created", success: true });
};

const updateOffer = async (req, res) => {
  let { id, type_id = "", offer_data, ...rest } = req.body;

  let arr = [];

  offer_data?.forEach((item) => {
    if (item.value?.includes("\n")) {
      item.value = item?.value?.split("\n");
      arr.push(item);
      return;
    }
    arr.push(item);
  });

  let obj = { ...rest, offer_data: arr };

  if (type_id) {
    obj.type_id = new ObjectId(type_id);
  }
  // console.log(data);
  const document = await Offer.findOneAndUpdate({ _id: id }, obj);

  if (!document) {
    return res.send({ success: false, message: "failed" });
  }

  return res.send({ data: document, message: "Offer Updated", success: true });
};

const updateRank = async (req, res) => {
  const { id, rank } = req.body;

  const offer = await Offer.findByIdAndUpdate(id, { rank });
  if (!offer) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Offer does not exists", success: false });
  }
  return res
    .status(StatusCodes.ACCEPTED)
    .json({ message: `Offer Rank Updated `, success: true, offer });
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
const updateIfFeatured = async (req, res) => {
  const { id, featured } = req.body;

  const offer = await Offer.findByIdAndUpdate(id, { featured });
  if (!offer) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Offer does not exists", success: false });
  }
  if (featured) {
    return res
      .status(StatusCodes.ACCEPTED)
      .json({ message: `Offer Featured `, success: true, offer });
  }
  return res
    .status(StatusCodes.ACCEPTED)
    .json({ message: `Offer not featured `, success: true, offer });
};

const deleteOffer = async (req, res) => {
  const { id } = req.body;

  const deleted = await Offer.findByIdAndDelete(id);

  if (!deleted?._doc?._id) {
    return res.send({
      message: "Failed to Delete",
      success: false,
    });
  }

  await DeletedData.create({ type: "offer", data: deleted?._doc })
    .then((e) => {})
    .catch((err) => console.log(err));

  return res.send({
    message: "Deleted Successfully",
    success: true,
  });
};

const getFeatured = async (req, res) => {
  const offer = await Offer.aggregate([
    {
      $match: { featured: true },
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
        path: "$category_info",
        preserveNullAndEmptyArrays: true, // Optional: Keeps documents that do not match the lookup
      },
    },
  ]);
  if (!offer) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: offer, message: "Data Fetched", success: true });
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
  deleteOffer,
  updateIfFeatured,
  getFeatured,
};
