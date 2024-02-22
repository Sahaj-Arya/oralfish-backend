const Bank = require("../models/Bank");
const { ObjectId } = require("mongodb");

const createBank = async (req, res) => {
  const { ...rest } = req.body;

  const ifExists = await Bank.findOne({ bank_name: rest?.bank_name });

  if (ifExists) {
    return res.send({ message: "Already Exists", success: false });
  }

  let data = { ...rest };

  if (req?.file) {
    let image = "http://localhost:5001/image/" + req.file.filename;
    data["image"] = image;
  }

  Bank.create({ ...data }, function (err, data) {
    if (err) {
      console.log(err);
      res.send({ success: false, message: "Failed", err });
    } else {
      return res.send({ data, message: "Data Fetched", success: true });
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
  const { id, ...rest } = req.body;

  // console.log(req.body, req.file, "jj");
  let data = { ...rest };

  if (req?.file) {
    let image = "http://localhost:5001/image/" + req.file.filename;
    data["image"] = image;
  }

  // const objectId = new ObjectId(id);
  await Bank.findByIdAndUpdate(id, { ...data }, function (err, data) {
    if (err) {
      console.log(err);
      res.send({ success: false, message: "Failed", err });
    } else {
      return res.send({ data, message: "Data Fetched", success: true });
    }
  });
};

module.exports = { getAllBanks, updateBank, createBank };
