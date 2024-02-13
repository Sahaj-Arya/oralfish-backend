const {} = require("mongodb");
const Offer = require("../models/Offer");
const mongoose = require("mongoose");

const getAllOffers = async (req, res) => {
  const document = await Offer.find({});

  if (!document) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: document, message: "Data Fetched", success: true });
};
const createOffer = async (req, res) => {
  const document = await Offer.find({});

  if (!document) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: document, message: "Data Fetched", success: true });
};

module.exports = { getAllOffers, createOffer };
