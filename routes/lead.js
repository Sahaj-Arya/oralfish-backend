const express = require("express");

const {
  getAllLeads,
  createLead,
  getLeadsById,
  settleLeads,
  getSelectedLeads,
} = require("../controllers/lead");

const router = express.Router();

router.route("/get-all-leads").get(getAllLeads);
router.route("/create-lead").post(createLead);
router.route("/get-leads-by-id").post(getLeadsById);
router.route("/settle-leads").post(settleLeads);
router.route("/get-selected-leads").post(getSelectedLeads);

module.exports = router;
