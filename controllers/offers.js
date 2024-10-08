const { ObjectId } = require("mongodb");
const { StatusCodes } = require("http-status-codes");

const Offer = require("../models/Offer");
const DeletedData = require("../models/DeletedData");
const { sendbulkNotificationFn } = require("./notification");
const Template = require("../models/Template");

const getAllOffers = async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      sortField = "date",
      sortOrder = "asc",
      search = "",
    } = req.query;

    const sortOrderValue = sortOrder === "asc" ? 1 : -1;

    const limitValue = parseInt(limit, 10);
    const skipValue = (parseInt(page, 10) - 1) * limitValue;

    // Define the sort object dynamically
    let sortOptions = {};
    if (sortField === "date") {
      sortOptions = { $sort: { created_at: sortOrderValue } };
    } else if (sortField === "price") {
      sortOptions = {
        $sort: { "mobile_data.earning_numeric": sortOrderValue },
      };
    }

    const pipeline = [
      {
        $match: {
          status: true,
          ...(search && {
            "mobile_data.title": { $regex: search, $options: "i" },
          }),
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
        $addFields: {
          "mobile_data.earning_numeric": { $toInt: "$mobile_data.earning" },
        },
      },
      sortOptions,
      {
        $skip: skipValue,
      },
      {
        $limit: limitValue,
      },
    ];

    const offer_doc = await Offer.aggregate(pipeline);

    // Get the total count of matching documents
    const totalDocuments = await Offer.countDocuments({
      status: true,
      ...(search && { "mobile_data.title": { $regex: search, $options: "i" } }),
    });
    const totalPages = Math.ceil(totalDocuments / limitValue);

    if (!offer_doc || offer_doc.length === 0) {
      return res
        .status(404)
        .send({ success: false, message: "No offers found" });
    }

    const nextPage =
      parseInt(page, 10) < totalPages ? parseInt(page, 10) + 1 : null;

    return res.status(200).send({
      data: offer_doc,
      message: "Data Fetched",
      success: true,
      pagination: {
        totalDocuments,
        totalPages,
        currentPage: parseInt(page, 10),
        nextPage,
      },
    });
  } catch (err) {
    return res.status(500).send({ success: false, message: err.message });
  }
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

const getEarnings = async (req, res) => {
  // console.log("fgf", req.body);

  try {
    const offer = await Offer.findOne({ _id: new ObjectId(req.body.id) });
    return res
      .status(200)
      .send({ success: true, earning: offer?._doc?.mobile_data?.earning });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
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

    // Add a $sort stage to ensure status:true is on top
    DATA.push({ $sort: { status: -1 } });

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
  try {
    let { type_id, offer_data, ...rest } = req.body;

    type_id = new ObjectId(type_id);

    const formattedOfferData = offer_data?.map((item) => {
      if (item.value?.includes("\n")) {
        item.value = item.value.split("\n");
      }
      return item;
    });

    const document = await Offer.create({
      ...rest,
      type_id,
      offer_data: formattedOfferData,
    });

    if (!document) {
      return res
        .status(500)
        .send({ success: false, message: "Offer creation failed" });
    }

    const { mobile_data } = document._doc;
    const data = {
      title: `New Offer - ${mobile_data?.title} `,
      body: `Alert : With ${mobile_data?.title} Earn upto ₹${mobile_data?.earning}`,
      image: mobile_data?.product_image,
      route: "SingleOffer",
      route_id: document._id?.toString(),
    };

    await sendbulkNotificationFn(data);

    return res
      .status(201)
      .send({ data: document, message: "Offer Created", success: true });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const updateOffer = async (req, res) => {
  let { id, type_id = "", offer_data, update, ...rest } = req.body;
  console.log(req.body?._id);
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

  Offer.findById({ _id: id }).then(async (offe) => {
    // console.log(offe?._doc?._id);
    let notiData = {
      title: `${offe?._doc?.mobile_data?.title} Price Update`,
      body: `Alert Price updated from ₹${offe?._doc?.mobile_data?.earning} to ₹${req.body?.mobile_data?.earning}`,
      image: req?.body?.mobile_data?.product_image,
      route: "SingleOffer",
      route_id: req?.body?.id,
    };

    if (
      offe?._doc?.mobile_data?.earning !== req?.body?.mobile_data?.earning &&
      offe?._doc?.status === true
    ) {
      await sendbulkNotificationFn(notiData);
    }

    const document = await Offer.findOneAndUpdate({ _id: id }, obj);

    if (!document) {
      return res.send({ success: false, message: "failed" });
    }
    return res.send({
      data: document,
      message: "Offer Updated",
      success: true,
    });
  });
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
  try {
    const {
      limit = 10,
      page = 1,
      sortField = "date",
      sortOrder = "asc",
      search = "",
      status = true,
    } = req.query;

    const sortOrderValue =
      sortField === "date"
        ? sortOrder === "asc"
          ? -1
          : 1
        : sortOrder === "asc"
        ? 1
        : -1;

    const limitValue = parseInt(limit, 10);
    const skipValue = (parseInt(page, 10) - 1) * limitValue;

    let sortOptions = {};
    if (sortField === "date") {
      sortOptions = { created_at: sortOrderValue };
    } else if (sortField === "price") {
      sortOptions = { "mobile_data.earning_numeric": sortOrderValue };
    }

    const matchConditions = [];
    if (status) {
      matchConditions.push({ status: status === "true" });
    }
    if (search) {
      matchConditions.push({
        "mobile_data.title": { $regex: search, $options: "i" },
      });
    }
    if (id) {
      matchConditions.push({ type_id: new ObjectId(id) });
    }

    const pipeline = [
      {
        $match: {
          ...(matchConditions.length > 0 ? { $and: matchConditions } : {}),
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
        $addFields: {
          "mobile_data.earning_numeric": {
            $convert: {
              input: "$mobile_data.earning",
              to: "int",
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      {
        $sort: sortOptions,
      },
      {
        $skip: skipValue,
      },
      {
        $limit: limitValue,
      },
      {
        $unwind: {
          path: "$category_info",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const offer_doc = await Offer.aggregate(pipeline);

    const totalDocuments = await Offer.countDocuments({
      ...(matchConditions.length > 0 ? { $and: matchConditions } : {}),
    });

    const totalPages = Math.ceil(totalDocuments / limitValue);

    if (!offer_doc || offer_doc.length === 0) {
      return res
        .status(200)
        .send({ success: false, message: "No offers found" });
    }

    const nextPage =
      parseInt(page, 10) <= totalPages ? parseInt(page, 10) + 1 : null;

    return res.status(200).send({
      data: offer_doc,
      message: "Data Fetched",
      success: true,
      pagination: {
        totalDocuments,
        totalPages,
        currentPage: parseInt(page, 10),
        nextPage,
      },
    });
  } catch (err) {
    return res.status(500).send({ success: false, message: err.message });
  }
};

const updateOfferStatus = async (req, res) => {
  const { id, status } = req.body;

  const query = { status };

  if (status === false) {
    query.featured = false;
    query.converting = false;
  }

  const offer = await Offer.findByIdAndUpdate(id, query);

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

const updateIfConverting = async (req, res) => {
  const { id, converting } = req.body;

  const offer = await Offer.findByIdAndUpdate(id, { converting });
  if (!offer) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Offer does not exists", success: false });
  }
  if (converting) {
    return res
      .status(StatusCodes.ACCEPTED)
      .json({ message: `Offer Updated `, success: true, offer });
  }
  return res
    .status(StatusCodes.ACCEPTED)
    .json({ message: `Offer Updated`, success: true, offer });
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
      $match: { featured: true, status: true },
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
  return res.send({
    data: offer,
    message: "Data Fetched",
    success: true,
    docs: offer?.length,
  });
};

const getTopConverting = async (req, res) => {
  const offer = await Offer.aggregate([
    {
      $match: { status: true, converting: true },
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
  return res.send({
    data: offer,
    message: "Data Fetched",
    success: true,
    docs: offer?.length,
  });
};

const getBestPayout = async (req, res) => {
  try {
    const offer = await Offer.aggregate([
      {
        $match: { status: true },
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
      {
        $addFields: {
          sortKey: {
            $cond: {
              if: { $isNumber: { $toDouble: "$mobile_data.earning" } },
              then: { $toDouble: "$mobile_data.earning" },
              else: 0, // You can replace 0 with another fallback value if needed
            },
          },
        },
      },
      {
        $sort: {
          sortKey: -1,
        },
      },
    ]);

    if (offer.length === 0) {
      return res
        .status(404)
        .send({ success: false, message: "No offers found" });
    }

    res.send({
      data: offer,
      message: "Data Fetched",
      success: true,
      docs: offer.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Server Error" });
  }
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
  getTopConverting,
  getBestPayout,
  updateIfConverting,
  getEarnings,
};
