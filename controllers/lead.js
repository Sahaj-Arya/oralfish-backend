const Lead = require("../models/Lead");
const Offer = require("../models/Offer");
const User = require("../models/User");
const Orders = require("../models/Orders");
const { ObjectId } = require("mongodb");
const { checkClickIdExists } = require("../utils/specialFunctions");

const getAllLeads = async (req, res) => {
  let limit = 100;

  const lead_doc = await Lead.aggregate([
    {
      $addFields: {
        // bank_id_obj: { $toObjectId: "$bank_id" },
        category_id_obj: { $toObjectId: "$category_id" },
        user_id_obj: { $toObjectId: "$user_id" },
        offer_id_obj: { $toObjectId: "$offer_id" },
      },
    },
    // {
    //   $lookup: {
    //     from: "banks",
    //     localField: "bank_id_obj",
    //     foreignField: "_id",
    //     as: "bank_info",
    //   },
    // },
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
        // bank_id_obj: 0,
        category_id_obj: 0,
        user_id_obj: 0,
        offer_id_obj: 0,
      },
    },
    // {
    //   $unwind: {
    //     path: "$bank_info",
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },
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
  return res.send({
    data: lead_doc,
    message: "Data Fetched",
    success: true,
    total: lead_doc?.length,
  });
};

const getLeadsById = async (req, res) => {
  const lead_doc = await Lead.aggregate([
    {
      $addFields: {
        // bank_id_obj: { $toObjectId: "$bank_id" },
        category_id_obj: { $toObjectId: "$category_id" },
        user_id_obj: { $toObjectId: "$user_id" },
        offer_id_obj: { $toObjectId: "$offer_id" },
      },
    },
    // {
    //   $lookup: {
    //     from: "banks",
    //     localField: "bank_id_obj",
    //     foreignField: "_id",
    //     as: "bank_info",
    //   },
    // },
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
        // bank_id_obj: 0,
        category_id_obj: 0,
        user_id_obj: 0,
        offer_id_obj: 0,
      },
    },
    // {
    //   $unwind: {
    //     path: "$bank_info",
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },
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
  let data = { length: 0, orders: [] };
  for (const e of updateData) {
    const verifyOffer = await Lead.findOne({
      click_id: e?.click_id,
      affiliate_id: e?.refferal_id,
    });

    if (verifyOffer) {
      verifyOffer.isComplete = e?.status;
      verifyOffer.remarks = e?.remarks ?? "";

      await verifyOffer.save();
      if (verifyOffer?.offer_id !== e?.offer_id)
        return res.send({ success: false, message: "Invalid offer selected" });
    }

    const offerID = new ObjectId(e?.offer_id);
    let offers = await Offer.findOne({ _id: offerID });

    if (!offers) {
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
      // settled: true,
    });

    if (e?.status === "approved" && !findOrder) {
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
};

// const settleLeads = async (req, res) => {

//   // console.log(req.body.data, "exw");
//   let updateData = req.body.data;
//   // return;
//   const bulkOperations = updateData.map((e) => {
//     return {
//       updateMany: {
//         filter: {
//           affiliate_id: e?.refferal_id,
//           click_id: e?.click_id,
//           approved: false,
//         },
//         update: { approved: e?.status, remarks: e?.remarks },
//         upsert: false,
//       },
//     };
//   });

//   for (const e of updateData) {
//     if (e?.status === true) {
//       const offer = await Offer.findOne({ title: e?.offer_name });
//       if (!offer) {
//         break;
//       }

//       const data = {
//         amount: offer?.earning,
//         rejected: false,
//         pending: true,
//         approved: false,
//         settled: false,
//         created: Date.now(),
//         updated: Date.now(),
//         offer_id: new ObjectId(offer?._id),
//         referral_id: e?.refferal_id,
//         click_id: e?.click_id,
//       };

//       let user = await User.findOne({ referral_id: e?.refferal_id });

//       if (checkClickIdExists(user?.lead_settlement, e?.click_id)) {
//         break;
//       }

//       // refferal_id,click_id,offer_name,status

//       let orderDetails = {
//         amount: offer?.earning,
//         rejected: false,
//         pending: true,
//         approved: false,
//         settled: false,
//         offer_id: new ObjectId(offer?._id),
//         referral_id: e?.refferal_id,
//         click_id: e?.click_id,
//         user_id: new ObjectId(user?._id),
//       };

//       const order = await Orders.create(orderDetails);

//       user.lead_settlement.push({ ...data, order_id: order?._id });
//       await user.save();
//     }
//   }

//   const result = await Lead.bulkWrite(bulkOperations);

//   if (!result) {
//     return res.send({ success: false, message: "Failed to update" });
//   }

//   return res.send({
//     message: `${
//       result.modifiedCount === 0
//         ? "No documents updated"
//         : result.modifiedCount + " " + "documents updated successfully"
//     } `,
//     success: true,
//   });
// };
