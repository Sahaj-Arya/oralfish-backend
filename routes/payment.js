const { createPayment, getPayments } = require("../controllers/payment");
const express = require("express");

const router = express.Router();

router.route("/create-payment").post(createPayment);
router.route("/get-all-payments").get(getPayments);

module.exports = router;
