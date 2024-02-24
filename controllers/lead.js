const Lead = require("../models/Lead");
const { ObjectId } = require("mongodb");

const getAllLeads = async (req, res) => {
  let limit = 10;

  const lead_doc = await Lead.aggregate([
    {
      $addFields: {
        bank_id_obj: { $toObjectId: "$bank_id" },
        category_id_obj: { $toObjectId: "$category_id" },
        user_id_obj: { $toObjectId: "$user_id" },
        offer_id_obj: { $toObjectId: "$offer_id" },
      },
    },
    {
      $lookup: {
        from: "banks",
        localField: "bank_id_obj",
        foreignField: "_id",
        as: "bank_info",
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
        bank_id_obj: 0,
        category_id_obj: 0,
        user_id_obj: 0,
        offer_id_obj: 0,
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
      $limit: limit,
    },
    // You can add additional stages here as needed.
  ]);

  if (!lead_doc) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: lead_doc, message: "Data Fetched", success: true });
};

const getLeadsById = async (req, res) => {
  const lead_doc = await Lead.aggregate([
    {
      $addFields: {
        bank_id_obj: { $toObjectId: "$bank_id" },
        category_id_obj: { $toObjectId: "$category_id" },
        user_id_obj: { $toObjectId: "$user_id" },
        offer_id_obj: { $toObjectId: "$offer_id" },
      },
    },
    {
      $lookup: {
        from: "banks",
        localField: "bank_id_obj",
        foreignField: "_id",
        as: "bank_info",
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
        bank_id_obj: 0,
        category_id_obj: 0,
        user_id_obj: 0,
        offer_id_obj: 0,
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
      $match: {
        user_id: req.body.user_id,
      },
    },

    // You can add additional stages here as needed.
  ]);

  // const lead_doc = await Lead.find({ user_id: req.body.user_id });

  if (!lead_doc) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: lead_doc, message: "Data Fetched", success: true });
};

const CreateLead = async (req, res) => {
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

module.exports = { getAllLeads, CreateLead, getLeadsById };
