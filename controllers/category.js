const Category = require("../models/Category");
const DeletedData = require("../models/DeletedData");

const getAllCategory = async (req, res) => {
  let obj = {};
  if (req?.body?.params) {
    obj = { ...req?.body?.params };
  }
  const document = await Category.find(obj);

  if (!document) {
    return res.send({ success: false, message: "failed" });
  }
  return res.send({ data: document, message: "Data Fetched", success: true });
};

const getCategoryById = async (req, res) => {
  const id = req.params.id;
  const document = await Category.findById(id);

  if (!document) {
    return res.send({ success: false, message: "Failed to get data" });
  }
  return res.send({ data: document, message: "Data Fetched", success: true });
};

const createCategory = async (req, res) => {
  const { name, ...rest } = req.body;

  const data = {
    name,
    ...rest,
  };

  // const newCategory = new Category(data);
  const ifExists = await Category.findOne({ name });

  if (ifExists) {
    return res.send({
      message: "Data already exists",
      success: false,
    });
  }
  const result = await Category.create(data);
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

const updateCategory = async (req, res) => {
  const { id, ...rest } = req.body;

  // console.log(id, );

  const result = await Category.findOneAndUpdate(
    { _id: id },
    {
      ...rest,
    }
  );

  if (!result) {
    return res.send({
      message: "Failed to Update",
      success: false,
    });
  }
  return res.send({
    data: result,
    message: "Updated Successfully",
    success: true,
  });
};

const deleteCategory = async (req, res) => {
  const { id } = req.body;

  const category = await Category.findById(id);

  const deleted = await Category.findByIdAndDelete(id);

  if (!deleted) {
    return res.send({
      message: "Failed to Delete",
      success: false,
    });
  }
  await DeletedData.create({ type: "category", data: category })
    .then((e) => {
      // console.log(e);
    })
    .catch((err) => console.log(err));
  return res.send({
    data: deleted,
    message: "Deleted Successfully",
    success: true,
  });
};

module.exports = {
  getAllCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
};
