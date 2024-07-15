const express = require("express");
const verifyTokenWeb = require("../middleware/verifyTokenWeb");
const {
  getProfile,
  updateProfile,
  getProfileWeb,
  getAllProfiles,
  setDefaultBank,
  ApproveProfile,
  updateBank,
  RedeemWallet,
} = require("../controllers/profile");
const { upload } = require("../utils/storageUtil");

const router = express.Router();

router.route("/get-profile").post(getProfile);
router.route("/approve-profile").post(ApproveProfile);
router.route("/get-all-profiles").get(getAllProfiles);
router.route("/set-default-bank").post(setDefaultBank);
router.route("/update-user-bank").post(updateBank);
router.route("/get-profile-web").post(verifyTokenWeb, getProfileWeb);
router.route("/update-profile").post(upload.array("image", 10), updateProfile);
router.route("/set-redeem-wallet").post(RedeemWallet);

module.exports = router;
