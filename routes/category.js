const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const {
  getAllCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
} = require("../controllers/category");

const router = express.Router();

router.route("/get-all-categories").get(getAllCategory).post(getAllCategory);
router.route("/get-category/:id").get(getCategoryById);
router.route("/create-category").post(createCategory);
router.route("/update-category").post(updateCategory);
router.route("/delete-category").post(deleteCategory);

module.exports = router;
