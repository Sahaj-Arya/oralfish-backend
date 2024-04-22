const Lead = require("../models/Lead");
const Offer = require("../models/Offer");
const User = require("../models/User");
const Orders = require("../models/Orders");
const { ObjectId } = require("mongodb");
const { checkClickIdExists } = require("../utils/specialFunctions");

const getAllLeads = async (req, res) => {
  let limit = 10;

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
  return res.send({ data: lead_doc, message: "Data Fetched", success: true });
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
  // console.log(req.body.data, "exw");
  let updateData = req.body.data;

  for (const e of updateData) {
    const verifyOffer = await Lead.find({
      click_id: e?.click_id,
      affiliate_id: e?.refferal_id,
    });

    if (verifyOffer.length > 0) {
      if (verifyOffer[0]?.offer_id !== e?.offer_id)
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
    };

    const findOrder = await Orders.find({
      click_id: e?.click_id,
      referral_id: e?.refferal_id,
      settled: true,
    });

    if (findOrder.length > 0) {
      return;
    }

    const order = await Orders.create(orderDetails);

    user.lead_settlement.push(order?._id);
    await user.save();
  }

  const bulkOperations = updateData.map((e) => {
    return {
      updateMany: {
        filter: {
          affiliate_id: e?.refferal_id,
          click_id: e?.click_id,
          isComplete: "pending",
        },
        update: { isComplete: e?.status, remarks: e?.remarks ?? "" },
        upsert: false,
      },
    };
  });
  const result = await Lead.bulkWrite(bulkOperations);

  if (!result) {
    return res.send({ success: false, message: "Failed to update" });
  }

  return res.send({
    message: `${
      result.modifiedCount === 0
        ? "No documents updated"
        : result.modifiedCount + " " + "Documents updated successfully"
    } `,
    success: true,
    result,
  });
};

module.exports = { getAllLeads, createLead, getLeadsById, settleLeads };

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
