const express = require("express");
const { getAllBanners, addBanner } = require("../controllers/banner");
const { getSingleImage } = require("../controllers/image");
const { upload } = require("../utils/storageUtil");

const router = express.Router();

router.route("/get-all-banners").get(getAllBanners);
router.route("/add-banner").post(upload.single("image"), addBanner);

module.exports = router;
