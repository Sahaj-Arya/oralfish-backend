const express = require("express");

const {
  getAllLeads,
  createLead,
  getLeadsById,
  settleLeads,
} = require("../controllers/lead");

const router = express.Router();

router.route("/get-all-leads").get(getAllLeads);
router.route("/create-lead").post(createLead);
router.route("/get-leads-by-id").post(getLeadsById);
router.route("/settle-leads").post(settleLeads);

module.exports = router;
