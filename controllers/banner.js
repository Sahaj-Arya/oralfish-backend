const Banner = require("../models/Banner");

const getAllBanners = async (req, res) => {
  try {
    let matchCondition = {};

    if (req?.body?.isActive) {
      matchCondition = { isActive: true, "offer_info.status": true };
    }

    const banners = await Banner.aggregate([
      {
        $addFields: {
          offer_id_obj: { $toObjectId: "$route_id" },
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
          offer_id_obj: 0,
        },
      },
      {
        $unwind: {
          path: "$offer_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: matchCondition,
      },
    ]);

    if (!banners || banners.length === 0) {
      return res.send({ success: false, message: "Failed to fetch data" });
    }

    return res.send({
      data: banners,
      message: "Data Fetched",
      success: true,
      docs: banners.length,
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return res
      .status(500)
      .send({ success: false, message: "Internal Server Error" });
  }
};

const addBanner = async (req, res) => {
  const { ...rest } = req.body;
  let data = { ...rest };

  if (!req.body) {
    return res.send({ success: false, message: "Data cannot be empty" });
  }
  const banner = await Banner.create({ ...data });

  return res.send({
    data: banner,
    message: "Banner Created successfully",
    success: true,
  });
};

const deleteBanner = async (req, res) => {
  if (!req.body.id) {
    return res.send({ success: false, message: "Data cannot be empty" });
  }
  const banner = await Banner.findByIdAndDelete(req.body.id);
  return res.send({
    data: banner,
    message: "Banner Created successfully",
    success: true,
  });
};

const editBanner = async (req, res) => {
  const { id, ...rest } = req.body;

  const banner = await Banner.findByIdAndUpdate(id, { ...rest });

  if (!banner) {
    return res.send({
      message: "Failed to update banner",
      success: false,
    });
  }

  return res.send({
    message: "Banner updated successfully",
    success: true,
  });
};

module.exports = { getAllBanners, addBanner, editBanner, deleteBanner };
