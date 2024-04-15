const { StatusCodes } = require("http-status-codes");
const Bank = require("../models/Bank");
const { ObjectId } = require("mongodb");

const createBank = async (req, res) => {
  const { ...rest } = req.body;

  const ifExists = await Bank.findOne({ bank_name: rest?.bank_name });

  if (ifExists) {
    return res.send({ message: "Already Exists", success: false });
  }

  let data = { ...rest };

  Bank.create({ ...data }, function (err, data) {
    if (err) {
      console.log(err);
      res.send({ success: false, message: "Failed", err });
    } else {
      return res
        .status(StatusCodes.CREATED)
        .send({ data, message: "Bank Added Successfully", success: true });
    }
  });
};

const getAllBanks = async (req, res) => {
  const document = await Bank.find({});

  if (!document) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: document, message: "Data Fetched", success: true });
};

const updateBank = async (req, res) => {
  let { id, bank_name, isActive, image } = req.body;

  let data = { bank_name, isActive };
  if (image) {
    data.image = image;
  }
  // console.log(data, id);
  await Bank.findByIdAndUpdate(id, { ...data }, function (err, data) {
    if (err) {
      console.log(err);
      res.send({ success: false, message: "Failed", err });
    } else {
      return res.send({ data, message: "Data Fetched", success: true });
    }
  });
};

const deleteBank = async (req, res) => {
  const { id } = req.body;

  await Bank.findByIdAndDelete(id, function (err, data) {
    if (err) {
      // console.log(err);
      res.send({ success: false, message: "Unable to delete", err });
    } else {
      return res.send({ data, message: "Deleted Successfully", success: true });
    }
  });
};

module.exports = { getAllBanks, updateBank, createBank, deleteBank };
