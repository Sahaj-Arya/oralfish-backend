const express = require("express");

const {
  singleNotification,
  multiNotification,
  sendSingleEmail,
  sendNotificationToAll,
  sendMultiEmail,
} = require("../controllers/notification");

const router = express.Router();

router.route("/single-notification").post(singleNotification);
router.route("/bulk-notification").post(sendNotificationToAll);
router.route("/multi-notification").post(multiNotification);
router.route("/send-mail").post(sendSingleEmail);
router.route("/send-multi-mail").post(sendMultiEmail);

module.exports = router;
