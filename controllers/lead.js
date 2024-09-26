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
      sortOrder = "desc",
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
        { click_id: { $regex: search, $options: "i" } },
        { affiliate_id: { $regex: search, $options: "i" } },
        { "offer_info.mobile_data.title": { $regex: search, $options: "i" } },
      ];
    }
    if (type && matchConditions?.$or?.length > 0) {
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
    let {
      limit = 10,
      page = 1,
      sortField = "date",
      sortOrder = "desc",
      search = "",
      type = "1",
    } = req.query;
    page = +page;
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

    if (type) {
      switch (type) {
        case "2":
          matchConditions.push({
            isComplete: "approved",
            status: "",
          });
          break;
        case "3":
          matchConditions.push({
            $or: [{ isComplete: "" }, { isComplete: "pending" }],
            status: "",
          });
          break;
        case "4":
          matchConditions.push({
            status: "settled",
          });
          break;
        case "5":
          matchConditions.push({ isComplete: "rejected", status: "" });
          break;
        default:
          break;
      }
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

const rejectLead = async (req, res) => {
  const { id, status } = req.body;
  // console.log(req.body);

  try {
    const lead = await Lead.findByIdAndUpdate(id, { isComplete: status });
    return res.send({
      data: lead,
      success: true,
    });
  } catch (error) {
    return res.send({
      error,
      message: "Failed",
      success: false,
    });
  }
};

const settleLeads = async (req, res) => {
  const updateData = req.body.data;

  const data = { length: 0, leads: [] };
  const offer_id = req.body.offer_id;

  const offer = await Offer.findById(offer_id);

  if (!offer?._id) {
    return res.send({
      message: "Invalid Offer",
      success: false,
    });
  }

  try {
    for (const e of updateData) {
      const { click_id, refferal_id, status, remarks = "" } = e;

      const lead = await Lead.findOne({
        click_id,
        affiliate_id: refferal_id,
      });

      if (offer_id !== lead?._doc?.offer_id) {
        return res.send({
          message: "Invalid Offer",
          success: false,
        });
      }

      if (status === "pending") {
        lead.isComplete = "pending";
        lead.remarks = remarks;
        await lead.save();
      } else if (status === "rejected") {
        lead.isComplete = "rejected";
        lead.remarks = remarks;
        await lead.save();
      } else if (
        // lead?._doc?.isComplete !== "approved" &&
        status === "approved" &&
        // lead?._doc?.status !== "settled" &&
        offer_id === lead?._doc?.offer_id
      ) {
        const user = await User.findOne({ referral_id: refferal_id });
        if (!user) {
          continue;
        }

        lead.isComplete = status;
        lead.remarks = remarks;
        user.lead_settlement.push(lead?._doc?._id);
        user.wallet = `${
          Number(user?._doc?.wallet || 0) +
          Number(offer?._doc?.mobile_data?.earning)
        }`;

        data.leads.push(lead?._doc);
        data.length++;

        await lead.save();
        await user.save();
      }
    }

    return res.send({
      message:
        data.length > 0
          ? `${data.length} lead(s) settled successfully`
          : "No lead updated",
      success: true,
      color: data.length > 0 ? "green" : "red",
    });
  } catch (error) {
    return res.send({
      error,
      message: "Failed",
      success: false,
    });
  }
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

const getSelectedLeadsById = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid or empty array of IDs" });
    }

    const objectIds = ids.map((id) => new ObjectId(id));
    const result = await Lead.aggregate([
      {
        $match: { _id: { $in: objectIds } },
      },
      {
        $addFields: {
          user_id_obj: { $toObjectId: "$user_id" },
          offer_id_obj: { $toObjectId: "$offer_id" },
        },
      },
      {
        $lookup: {
          from: "offers",
          localField: "offer_id_obj",
          foreignField: "_id",
          as: "offer_details",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id_obj",
          foreignField: "_id",
          as: "user_details",
        },
      },
      {
        $unwind: {
          path: "$user_details",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$offer_details",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          user_id_obj: 0,
          offer_id_obj: 0,
        },
      },
    ]);
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
  getSelectedLeadsById,
  rejectLead,
};
