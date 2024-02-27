const express = require("express");

const { singleNotification, multiNotification } = require("../controllers/notification");

const router = express.Router();

router.route("/single-notification").post(singleNotification);
router.route("/multi-notification").post(multiNotification);

module.exports = router;
