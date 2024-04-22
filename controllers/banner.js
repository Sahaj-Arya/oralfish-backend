const Banner = require("../models/Banner");

const getAllBanners = async (req, res) => {
  let obj = {};
  if (req?.body?.isActive) {
    obj.isActive = true;
  }

  // console.log(req.body, "kkk");

  const document = await Banner.find(obj);

  if (!document) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: document, message: "Data Fetched", success: true });
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
