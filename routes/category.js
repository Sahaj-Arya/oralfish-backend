const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const {
  getAllCategory,
  createCategory,
  updateCategory,
} = require("../controllers/category");

const router = express.Router();

router.route("/get-all-categories").get(getAllCategory);
router.route("/create-category").post(createCategory);
router.route("/update-category").post(updateCategory);

module.exports = router;
