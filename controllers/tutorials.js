const { StatusCodes } = require("http-status-codes");
const Tutorial = require("../models/Tutorial");

const getAllTutorials = async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      sortField = "date",
      sortOrder = "desc",
      search = "",
      status = true,
      type = "", // Type parameter
    } = req.query;

    // Construct the base search query
    const searchQuery = {
      $and: [
        { status: status === true }, // Ensure the status is boolean
        {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { video: { $regex: search, $options: "i" } },
          ],
        },
      ],
    };

    // Add type filter if it's provided and not an empty string
    if (type) {
      searchQuery.$and.push({ type: { $regex: type, $options: "i" } });
    }

    // Fetch tutorials based on the search query, pagination, and sorting
    const tutorials = await Tutorial.find(searchQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ [sortField]: sortOrder === "desc" ? -1 : 1 })
      .exec();

    // Count total number of matching tutorials
    const total = await Tutorial.countDocuments(searchQuery);

    // Handle case where no tutorials are found
    if (!tutorials || tutorials.length === 0) {
      return res.status(200).json({
        message: "No tutorials found",
        success: true,
      });
    }

    // Return successful response with tutorials data
    return res.status(StatusCodes.OK).json({
      message: "Successful",
      data: tutorials,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTutorials: total,
      success: true,
    });
  } catch (error) {
    // Handle server errors
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
      success: false,
    });
  }
};

const createTutorial = async (req, res) => {
  const {
    status = true,
    rank = 1,
    title,
    video,
    subject = "",
    type = "",
  } = req.body;
  if (!title && !video) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Missing details", status: false });
  }

  const tutorials = await Tutorial.create({
    status,
    rank,
    title,
    video,
    subject,
    type,
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

  const tutorial = await Tutorial.findByIdAndUpdate(id, { ...rest });

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

  const tutorial = await Tutorial.findByIdAndDelete(id);

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
