const express = require("express");
const { getAllBanners } = require("../controllers/banner");

const router = express.Router();

router.route("/get-all-banners").get(getAllBanners);
// router.route("/:id").get(getJob).delete(deleteJob).patch(updateJob);

module.exports = router;
