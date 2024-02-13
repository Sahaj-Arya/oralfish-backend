const {} = require("mongodb");
const Category = require("../models/Category");

const getAllCategory = async (req, res) => {
  const document = await Category.find({});

  if (!document) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: document, message: "Data Fetched", success: true });
};

const createCategory = async (req, res) => {
  const { name, icon, iconType, type_id, size } = req.body;

  const data = {
    name,
    icon,
    iconType,
    type_id,
    size,
  };

  const newCategory = new Category(data);
  const ifExists = await Category.findOne(data);

  if (ifExists) {
    return res.send({
      message: "Data already exists",
      success: false,
    });
  }
  const result = await newCategory.save();
  if (!result) {
    return res.send({
      message: "Failed to create category",
      success: false,
    });
  }
  return res.send({
    data: result,
    message: "Created new category",
    success: true,
  });
};

module.exports = { getAllCategory, createCategory };
