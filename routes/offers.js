const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const {
  getAllOffers,
  createOffer,
  getOfferWeb,
  getOfferById,
  updateOffer,
  updateRank,
} = require("../controllers/offers");
const { upload } = require("../utils/storageUtil");

const router = express.Router();

router.route("/get-all-offers").get(getAllOffers);
router.route("/create-offer").post(upload.array("image", 10), createOffer);
router.route("/update-offer").post(upload.array("image", 10), updateOffer);
router.route("/update-offer-rank").post(updateRank);
router.route("/get-offer-web").post(getOfferWeb);
router.route("/get-offer-by-id").post(getOfferById);

module.exports = router;
