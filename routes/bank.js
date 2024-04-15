const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const { getAllCategory, createCategory } = require("../controllers/category");
const {
  getAllBanks,
  updateBank,
  createBank,
  deleteBank,
} = require("../controllers/Bank");
const { upload } = require("../utils/storageUtil");

const router = express.Router();

router.route("/get-all-banks").get(getAllBanks);
router.route("/update-bank").post( updateBank);
router.route("/create-bank").post( createBank);
router.route("/delete-bank").post(deleteBank);

module.exports = router;
