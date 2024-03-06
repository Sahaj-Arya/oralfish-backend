const express = require("express");
const verifyTokenWeb = require("../middleware/verifyTokenWeb");
const {
  getProfile,
  updateProfile,
  getProfileWeb,
  getAllProfiles,
  updateBank,
} = require("../controllers/profile");
const { upload } = require("../utils/storageUtil");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.route("/get-profile").post(verifyToken, getProfile);
router.route("/get-all-profiles").get(getAllProfiles);
router.route("/get-profile-web").post(verifyTokenWeb, getProfileWeb);
router.route("/update-profile").post(upload.array("image", 10), updateProfile);
router.route("/update-user-bank").post(upload.array("image", 10), updateBank);

module.exports = router;
