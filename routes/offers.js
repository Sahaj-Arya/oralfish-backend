const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const {
  getAllOffers,
  createOffer,
  getOfferWeb,
} = require("../controllers/offers");
const { upload } = require("../utils/storageUtil");

const router = express.Router();

router.route("/get-all-offers").get(getAllOffers);
router.route("/create-offer").post(upload.array("image", 10), createOffer);
router.route("/get-offer-web").post(getOfferWeb);

module.exports = router;
