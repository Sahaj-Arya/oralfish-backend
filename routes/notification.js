const express = require("express");

const {
  singleNotification,
  multiNotification,
  sendSingleEmail,
  sendNotificationToAll,
  sendMultiEmail,
  bulkNotification,
} = require("../controllers/notification");

const router = express.Router();

router.route("/single-notification").post(singleNotification);
// router.route("/bulk-notification").post(sendNotificationToAll);
router.route("/multi-notification").post(multiNotification);
router.route("/bulk-notification").post(bulkNotification);
router.route("/send-mail").post(sendSingleEmail);
router.route("/send-multi-mail").post(sendMultiEmail);

module.exports = router;
1;
