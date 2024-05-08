const express = require("express");
const verifyTokenWeb = require("../middleware/verifyTokenWeb");
const { getOrderByUid, getSelectedOrders } = require("../controllers/order");

const router = express.Router();

router.route("/get-orders-by-uid").post(getOrderByUid);
router.route("/get-selected-orders").post(getSelectedOrders);

module.exports = router;
