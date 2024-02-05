const express = require("express");
const { getSingleImage } = require("../controllers/image");

const router = express.Router();

router.route("/:id").get(getSingleImage);

module.exports = router;
