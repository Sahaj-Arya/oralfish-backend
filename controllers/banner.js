const Banner = require("../models/Banner");

const getAllBanners = async (req, res) => {
  const document = await Banner.find({});

  if (!document) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: document, message: "Data Fetched", success: true });
};

module.exports = { getAllBanners };
