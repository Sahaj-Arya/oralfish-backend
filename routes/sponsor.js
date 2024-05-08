const express = require("express");
const {
  getAllSponsors,
  addSponsor,
  editSponsor,
  deleteSponsor,
} = require("../controllers/sponsor");

const router = express.Router();

router.route("/get-all-sponsors").get(getAllSponsors).post(getAllSponsors);
router.route("/add-sponsor").post(addSponsor);
router.route("/edit-sponsor").post(editSponsor);
router.route("/delete-sponsor").post(deleteSponsor);

module.exports = router;
