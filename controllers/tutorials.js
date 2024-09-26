const { StatusCodes } = require("http-status-codes");
const Template = require("../models/Template");
const Tutorials = require("../models/tutorials");

const getAllTutorials = async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      sortField = "date",
      sortOrder = "desc",
      search = "",
      status = true,
    } = req.query;

    const searchQuery = {
      $and: [
        { status: status === true },
        {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { video: { $regex: search, $options: "i" } },
          ],
        },
      ],
    };

    const tutorials = await Tutorials.find(searchQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ [sortField]: sortOrder === "desc" ? -1 : 1 })
      .exec();

    const total = await Tutorials.countDocuments(searchQuery);

    if (!tutorials || tutorials.length === 0) {
      return res.status(400).json({
        message: "No tutorials found",
        success: false,
      });
    }

    return res.status(StatusCodes.OK).json({
      message: "Successful",
      data: tutorials,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTutorials: total,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
      success: false,
    });
  }
};

const createTutorial = async (req, res) => {
  const { status = true, rank = 1, title, video } = req.body;
  if (!title && !video) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Missing details", status: false });
  }

  const tutorials = await Tutorials.create({
    status,
    rank,
    title,
    video,
  });

  if (!tutorials) {
    return res.status(400).json({
      error: "Failed to create tutorials",
      message: tutorials,
      success: false,
    });
  }
  return res.status(StatusCodes.CREATED).json({
    message: "Tutorial created successfully",
    data: tutorials,
    success: true,
  });
};

const updateTutorial = async (req, res) => {
  const { id, ...rest } = req.body;

  const tutorial = await Tutorials.findByIdAndUpdate(id, { ...rest });

  if (!tutorial) {
    return res.status(400).json({
      message: "tutorial does not exists",
      error: tutorial,
      success: false,
    });
  }

  return res.status(StatusCodes.CREATED).json({
    message: "Tutorial updated successfully",
    data: tutorial,
    success: true,
  });
};

const deleteTutorial = async (req, res) => {
  const { id } = req.body;

  const tutorial = await Tutorials.findByIdAndDelete(id);

  if (!tutorial) {
    return res.status(400).json({
      message: "Failed to delete tutorial",
      error: tutorial,
      success: false,
    });
  }

  return res.status(StatusCodes.CREATED).json({
    message: "Tutorial deleted successfully",
    data: tutorial,
    success: true,
  });
};

module.exports = {
  getAllTutorials,
  createTutorial,
  updateTutorial,
  deleteTutorial,
};
