const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const { getAllOffers, createOffer } = require("../controllers/offers");

const router = express.Router();

router.route("/get-all-offers").get(getAllOffers);
router.route("/create-offer").post(createOffer);

module.exports = router;
