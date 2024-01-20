const express = require("express");

const { single, upload } = require("../controllers/upload");

const router = express.Router();

router.route("/single-image", upload.single("profile")).post(single);

module.exports = router;
