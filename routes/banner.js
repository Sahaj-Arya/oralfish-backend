const express = require("express");
const {
  getAllBanners,
  addBanner,
  editBanner,
  deleteBanner,
} = require("../controllers/banner");
const { getSingleImage } = require("../controllers/image");
const { upload } = require("../utils/storageUtil");

const router = express.Router();

router.route("/get-all-banners").post(getAllBanners);
router.route("/add-banner").post(addBanner);
router.route("/edit-banner").post(editBanner);
router.route("/delete-banner").post(deleteBanner);

module.exports = router;
