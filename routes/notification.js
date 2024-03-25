const express = require("express");

const { singleNotification, multiNotification, sendSingleEmail } = require("../controllers/notification");

const router = express.Router();

router.route("/single-notification").post(singleNotification);
router.route("/multi-notification").post(multiNotification);
router.route("/send-mail").post(sendSingleEmail);

module.exports = router;
