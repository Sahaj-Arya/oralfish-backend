const {
  createPayment,
  getPayments,
  getPaymentPdf,
  settlePayment,
  settlePaymentOffline,
  settlePaymentOnline,
  getPaymentMobile,
} = require("../controllers/payment");
const express = require("express");

const router = express.Router();

router.route("/create-payment").post(createPayment);
router.route("/get-all-payments").get(getPayments).post(getPaymentMobile);
router.route("/generate-payment-pdf").post(getPaymentPdf);
router.route("/settle-payment-offline").post(settlePaymentOffline);
router.route("/settle-payment-online").post(settlePaymentOnline);

module.exports = router;
