const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const {
  getAllOffers,
  createOffer,
  getOfferWeb,
  getOfferById,
  updateOffer,
  updateRank,
  updateOfferStatus,
  getAllOffersWeb,
  getSelectedOffersWeb,
  deleteOffer,
  updateIfFeatured,
  getFeatured,
} = require("../controllers/offers");
const { upload } = require("../utils/storageUtil");

const router = express.Router();

router.route("/get-all-offers").get(getAllOffers);
router.route("/get-all-offers-web").get(getAllOffersWeb);
router.route("/get-selected-offers-web").post(getSelectedOffersWeb);
router.route("/update-offer-status").post(updateOfferStatus);
router.route("/create-offer").post(createOffer);
router.route("/update-offer").post(updateOffer);
router.route("/update-offer-rank").post(updateRank);
router.route("/get-offer-web").post(getOfferWeb);
router.route("/get-offer-by-id").post(getOfferById);
router.route("/delete-offer").post(deleteOffer);
router.route("/update-featured").post(updateIfFeatured);
router.route("/get-featured").get(getFeatured);

module.exports = router;
