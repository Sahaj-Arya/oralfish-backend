const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const { getProfile } = require("../controllers/profile");

const router = express.Router();

router.route("/get-profile").all(verifyToken).post(getProfile);
// router.route("/:id").get(getJob).delete(deleteJob).patch(updateJob);

module.exports = router;
