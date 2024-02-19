const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const { getAllCategory, createCategory } = require("../controllers/category");
const { getAllBanks, updateBank, createBank } = require("../controllers/Bank");
const { upload } = require("../utils/storageUtil");

const router = express.Router();

router.route("/get-all-banks").get(getAllBanks);
router.route("/update-bank").post(upload.single("image")).post(updateBank);
router.route("/create-bank").post(upload.single("image")).post(createBank);

module.exports = router;
