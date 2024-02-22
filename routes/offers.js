const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const {
  getAllOffers,
  createOffer,
  getOfferWeb,
} = require("../controllers/offers");

const router = express.Router();

router.route("/get-all-offers").get(getAllOffers);
router.route("/create-offer").post(createOffer);
router.route("/get-offer-web").post(getOfferWeb);

module.exports = router;
