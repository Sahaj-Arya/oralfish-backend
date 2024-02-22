const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const {
  getProfile,
  updateProfile,
  getProfileWeb,
} = require("../controllers/profile");
const { upload } = require("../utils/storageUtil");

const router = express.Router();

router.route("/get-profile").post(getProfile);
router.route("/get-profile-web").post(getProfileWeb);
router.route("/update-profile").post(upload.array("image", 10), updateProfile);

module.exports = router;
