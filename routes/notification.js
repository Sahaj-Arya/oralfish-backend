const express = require("express");

const { singleNotification } = require("../controllers/notification");

const router = express.Router();

router.route("/single-notification").post(singleNotification);

module.exports = router;
