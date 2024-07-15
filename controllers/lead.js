const Lead = require("../models/Lead");
const Offer = require("../models/Offer");
const User = require("../models/User");
const Orders = require("../models/Orders");
const { ObjectId } = require("mongodb");
const { checkClickIdExists } = require("../utils/specialFunctions");

const getAllLeads = async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      sortField = "date",
      sortOrder = "asc",
      search = "",
      fromDate,
      toDate,
      type,
    } = req.query;

    const sortOrderValue = sortOrder === "asc" ? 1 : -1;
    const limitValue = parseInt(limit, 10);
    const skipValue = (parseInt(page, 10) - 1) * limitValue;

    const matchConditions = {};
    if (search) {
      matchConditions.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { "offer_info.mobile_data.title": { $regex: search, $options: "i" } },
      ];
    }
    if (type && matchConditions?.$or) {
      matchConditions.$or.push({
        "offer_info._id": new ObjectId(type),
      });
    } else if (type && !matchConditions?.$or) {
      matchConditions.$or = [
        {
          "offer_info._id": new ObjectId(type),
        },
      ];
    }
    if (fromDate && toDate) {
      matchConditions.created = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    const pipeline = [
      {
        $addFields: {
          category_id_obj: { $toObjectId: "$category_id" },
          user_id_obj: { $toObjectId: "$user_id" },
          offer_id_obj: { $toObjectId: "$offer_id" },
        },
      },
      {
        $lookup: {
          from: "category",
          localField: "category_id_obj",
          foreignField: "_id",
          as: "category_info",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id_obj",
          foreignField: "_id",
          as: "user_info",
        },
      },
      {
        $lookup: {
          from: "offers",
          localField: "offer_id_obj",
          foreignField: "_id",
          as: "offer_info",
        },
      },

      {
        $project: {
          category_id_obj: 0,
          user_id_obj: 0,
          offer_id_obj: 0,
        },
      },
      {
        $unwind: {
          path: "$category_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$user_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$offer_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: Object.keys(matchConditions).length > 0 ? matchConditions : {},
      },
    ];

    if (sortField) {
      pipeline.push({
        $sort: sortField === "date" ? { created: sortOrderValue } : {},
      });
    }
    const countPipeline = [
      ...pipeline,
      {
        $count: "total",
      },
    ];
    const countResult = await Lead.aggregate(countPipeline);

    if (skipValue) {
      pipeline.push({
        $skip: skipValue,
      });
    }
    if (limit) {
      pipeline.push({
        $limit: limitValue,
      });
    }

    const lead_doc = await Lead.aggregate(pipeline);

    const totalDocuments = countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalDocuments / limitValue);

    if (!lead_doc || lead_doc.length === 0) {
      return res
        .status(200)
        .send({ success: false, message: "No Leads Found" });
    }

    const nextPage =
      parseInt(page, 10) < totalPages ? parseInt(page, 10) + 1 : null;

    return res.send({
      data: lead_doc,
      message: "Data Fetched",
      success: true,
      pagination: {
        totalDocuments,
        totalPages,
        currentPage: parseInt(page, 10),
        nextPage,
        limit: limitValue,
      },
    });
  } catch (err) {
    return res.status(500).send({ success: false, message: err.message });
  }
};

const downloadAllLeads = async (req, res) => {
  try {
    const {
      sortField = "date",
      sortOrder = "asc",
      search = "",
      fromDate,
      toDate,
      type,
    } = req.query;

    const sortOrderValue = sortOrder === "asc" ? 1 : -1;

    const matchConditions = {};
    if (search) {
      matchConditions.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { "offer_info.mobile_data.title": { $regex: search, $options: "i" } },
      ];
    }
    if (type && matchConditions?.$or) {
      matchConditions.$or.push({
        "offer_info._id": new ObjectId(type),
      });
    } else if (type && !matchConditions?.$or) {
      matchConditions.$or = [
        {
          "offer_info._id": new ObjectId(type),
        },
      ];
    }
    if (fromDate && toDate) {
      matchConditions.created = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    const pipeline = [
      {
        $addFields: {
          category_id_obj: { $toObjectId: "$category_id" },
          user_id_obj: { $toObjectId: "$user_id" },
          offer_id_obj: { $toObjectId: "$offer_id" },
        },
      },
      {
        $lookup: {
          from: "category",
          localField: "category_id_obj",
          foreignField: "_id",
          as: "category_info",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id_obj",
          foreignField: "_id",
          as: "user_info",
        },
      },
      {
        $lookup: {
          from: "offers",
          localField: "offer_id_obj",
          foreignField: "_id",
          as: "offer_info",
        },
      },

      {
        $project: {
          category_id_obj: 0,
          user_id_obj: 0,
          offer_id_obj: 0,
        },
      },
      {
        $unwind: {
          path: "$category_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$user_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$offer_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: Object.keys(matchConditions).length > 0 ? matchConditions : {},
      },
    ];

    if (sortField) {
      pipeline.push({
        $sort: sortField === "date" ? { created: sortOrderValue } : {},
      });
    }
    const countPipeline = [
      ...pipeline,
      {
        $count: "total",
      },
    ];

    const countResult = await Lead.aggregate(countPipeline);

    const lead_doc = await Lead.aggregate(pipeline);

    const totalDocuments = countResult.length > 0 ? countResult[0].total : 0;

    if (!lead_doc || lead_doc.length === 0) {
      return res
        .status(200)
        .send({ success: false, message: "No Leads Found" });
    }

    return res.send({
      data: lead_doc,
      message: "Data Fetched",
      success: true,
      pagination: {
        totalDocuments,
      },
    });
  } catch (err) {
    return res.status(500).send({ success: false, message: err.message });
  }
};

const getLeadsById = async (req, res) => {
  const { user_id } = req.body;
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

    let sortOptions = {};
    if (sortField === "date") {
      sortOptions = { created: sortOrderValue };
    }

    const matchConditions = [];
    if (search) {
      matchConditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { "offer_info.mobile_data.title": { $regex: search, $options: "i" } },
        ],
      });
    }
    if (user_id) {
      matchConditions.push({ user_id });
    }

    const pipeline = [
      {
        $match: matchConditions.length > 0 ? { $and: matchConditions } : {},
      },
      {
        $addFields: {
          category_id_obj: { $toObjectId: "$category_id" },
          user_id_obj: { $toObjectId: "$user_id" },
          offer_id_obj: { $toObjectId: "$offer_id" },
        },
      },
      {
        $lookup: {
          from: "category",
          localField: "category_id_obj",
          foreignField: "_id",
          as: "category_info",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id_obj",
          foreignField: "_id",
          as: "user_info",
        },
      },
      {
        $lookup: {
          from: "offers",
          localField: "offer_id_obj",
          foreignField: "_id",
          as: "offer_info",
        },
      },
      {
        $match: matchConditions.length > 0 ? { $and: matchConditions } : {},
      },
      {
        $project: {
          category_id_obj: 0,
          user_id_obj: 0,
          offer_id_obj: 0,
        },
      },
      {
        $unwind: {
          path: "$category_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$user_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$offer_info",
          preserveNullAndEmptyArrays: true,
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
    ];

    const lead_doc = await Lead.aggregate(pipeline);

    const totalDocuments = await Lead.countDocuments(
      matchConditions.length > 0 ? { $and: matchConditions } : {}
    );
    const totalPages = Math.ceil(totalDocuments / limitValue);

    if (!lead_doc || lead_doc.length === 0) {
      return res
        .status(200)
        .send({ success: false, message: "No Leads found" });
    }

    const nextPage =
      parseInt(page, 10) < totalPages ? parseInt(page, 10) + 1 : null;

    return res.send({
      data: lead_doc,
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

const createLead = async (req, res) => {
  const createdUser = await Lead.create(req.body);
  if (!createdUser) {
    return res.send({ success: false, message: "Failed to create lead", err });
  }

  return res.send({
    data: createdUser,
    message: "Lead created successfully",
    success: true,
  });
};

const settleLeads = async (req, res) => {
  let updateData = req.body.data;
  // console.log(updateData);
  let data = { length: 0, orders: [] };
  for (const e of updateData) {
    let verifyOfferdoc = await Lead.findOne({
      click_id: e?.click_id,
      affiliate_id: e?.refferal_id,
    });
    let verifyOffer = verifyOfferdoc?._doc;
    if (verifyOffer) {
      verifyOfferdoc.isComplete = e?.status;
      verifyOfferdoc.remarks = e?.remarks ?? "";

      await verifyOfferdoc.save();
      if (verifyOffer?.offer_id !== e?.offer_id)
        return res.send({ success: false, message: "Invalid offer selected" });
    }

    const offerID = new ObjectId(e?.offer_id);
    let offers = await Offer.findOne({ _id: offerID });

    if (!offers?._doc?._id) {
      break;
    }

    let user = await User.findOne({ referral_id: e?.refferal_id });

    let orderDetails = {
      amount: Number(offers?._doc?.mobile_data?.earning),
      status: e?.status,
      settled: false,
      offer_id: offerID,
      referral_id: e?.refferal_id,
      click_id: e?.click_id,
      created: Date.now(),
      updated: Date.now(),
      user_id: new ObjectId(user?._id),
      lead_id: new ObjectId(verifyOffer?._id),
    };

    const findOrder = await Orders.findOne({
      click_id: e?.click_id,
      referral_id: e?.refferal_id,
      // settled: false,
    });
    console.log(findOrder?._doc?._id, "findOrder?._doc?._id");

    if (e?.status === "approved" && !findOrder?._doc?._id) {
      let order = await Orders.create(orderDetails);
      data.orders.push(order);
      data.length++;

      user.order_settlement = [...user?.order_settlement, order?._id];
      await user.save();
    }
  }
  if (data.length === 0) {
    return res.send({
      message: "No order created",
      success: true,
    });
  }
  return res.send({
    message: `${data?.length} orders created succesfully`,
    color: "green",
    success: true,
  });
};

const getSelectedLeads = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid or empty array of IDs" });
    }

    const objectIds = ids.map((item) => item?._id);

    const result = await Lead.find({ _id: { $in: objectIds } });

    if (!result || result.length === 0) {
      return res
        .status(200)
        .send({ success: false, message: "No leads found" });
    }

    return res.send({
      success: true,
      message: "Leads fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getAllLeads,
  createLead,
  getLeadsById,
  settleLeads,
  getSelectedLeads,
  downloadAllLeads,
};
