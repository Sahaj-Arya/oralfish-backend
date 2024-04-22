const { StatusCodes } = require("http-status-codes");
const Template = require("../models/Template");

const getAllTemplates = async (req, res) => {
  const templates = await Template.find({});
  if (!templates) {
    return res.status(400).json({
      message: "Failed",
      error: templates,
      success: false,
    });
  }
  return res.status(StatusCodes.CREATED).json({
    message: "Successfull",
    data: templates,
    success: true,
  });
};

const createTemplate = async (req, res) => {
  const { image = "", type, title, subject, message } = req.body;

  let data = {};
  if (type == "email") {
    data = { image, type, title, subject, message };
  } else {
    data = { image, type, title, message };
  }

  const template = await Template.create(data);

  if (!template) {
    return res.status(400).json({
      error: "Failed to create template",
      message: template,
      success: false,
    });
  }
  return res.status(StatusCodes.CREATED).json({
    message: "Termplate created successfully",
    data: template,
    success: true,
  });
};

const updateTemplate = async (req, res) => {
  const { id, __v, ...rest } = req.body;

  const template = await Template.findByIdAndUpdate(id, { ...rest });

  if (!template) {
    return res.status(400).json({
      message: "Template does not exists",
      error: template,
      success: false,
    });
  }

  return res.status(StatusCodes.CREATED).json({
    message: "Termplate created successfully",
    data: template,
    success: true,
  });
};

const deleteTemplate = async (req, res) => {
  const { id } = req.body;

  const template = await Template.findByIdAndDelete(id);

  if (!template) {
    return res.status(400).json({
      message: "Failed to delete",
      error: template,
      success: false,
    });
  }

  return res.status(StatusCodes.CREATED).json({
    message: "Deleted Successfully",
    data: template,
    success: true,
  });
};

module.exports = { getAllTemplates, createTemplate, updateTemplate,deleteTemplate };
