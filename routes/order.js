const express = require("express");
const verifyTokenWeb = require("../middleware/verifyTokenWeb");
const {
  getOrderByUid,
  getSelectedOrders,
  approveOrders,
  downloadAllOrders,
} = require("../controllers/order");

const router = express.Router();

router.route("/get-orders-by-uid").post(getOrderByUid);
router.route("/download-all-orders").get(downloadAllOrders);
router.route("/get-selected-orders").post(getSelectedOrders);
router.route("/approve-orders").post(approveOrders);

module.exports = router;
