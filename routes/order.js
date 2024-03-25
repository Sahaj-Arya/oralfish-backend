const express = require("express");
const verifyTokenWeb = require("../middleware/verifyTokenWeb");
const { getOrderByUid } = require("../controllers/order");

const router = express.Router();

router.route("/get-orders-by-uid").post(getOrderByUid);

module.exports = router;
