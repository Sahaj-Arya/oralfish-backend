const Banner = require("../models/Banner");
const Sponsor = require("../models/Sponsor");

const getAllSponsors = async (req, res) => {
  let obj = {};
  if (req?.body?.isActive) {
    obj.isActive = true;
  }
  const document = await Sponsor.find(obj);

  if (!document) {
    return res.send({
      success: false,
      message: "Failed to get sponsored Ad",
    });
  }
  return res.send({ data: document, message: "Data Fetched", success: true });
};

const addSponsor = async (req, res) => {
  const { ...rest } = req.body;
  let data = { ...rest };

  if (!req.body) {
    return res.send({ success: false, message: "Data cannot be empty" });
  }
  const sponsor = await Sponsor.create({ ...data });

  if (!sponsor) {
    return res.send({ success: false, message: "Failed to create sponsor" });
  }

  return res.send({
    data: sponsor,
    message: "Sponsored Ad Created successfully",
    success: true,
  });
};

const deleteSponsor = async (req, res) => {
  if (!req.body.id) {
    return res.send({ success: false, message: "Data cannot be empty" });
  }
  const sponsor = await Sponsor.findByIdAndDelete(req.body.id);
  return res.send({
    data: sponsor,
    message: "Sponsored  Deleted successfully",
    success: true,
  });
};

const editSponsor = async (req, res) => {
  const { id, ...rest } = req.body;

  const sponsor = await Sponsor.findByIdAndUpdate(id, { ...rest });

  if (!sponsor) {
    return res.send({
      message: "Failed to update sponsered Ad",
      success: false,
    });
  }

  return res.send({
    message: "Sponsered ad updated successfully",
    success: true,
  });
};

module.exports = { getAllSponsors, addSponsor, editSponsor, deleteSponsor };
