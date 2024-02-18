const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const { getProfile, updateProfile } = require("../controllers/profile");
const { upload } = require("../utils/storageUtil");

const router = express.Router();

router.route("/get-profile").post(verifyToken).post(getProfile);
router.route("/update-profile").post(upload.array("image", 10), updateProfile);
// router.route("/:id").get(getJob).delete(deleteJob).patch(updateJob);

module.exports = router;
