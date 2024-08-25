const express = require("express");

const {
  getAllLeads,
  createLead,
  getLeadsById,
  settleLeads,
  getSelectedLeads,
  downloadAllLeads,
  getSelectedLeadsById,
} = require("../controllers/lead");

const router = express.Router();

router.route("/get-all-leads").get(getAllLeads);
router.route("/download-all-leads").get(downloadAllLeads);
router.route("/create-lead").post(createLead);
router.route("/get-leads-by-id").post(getLeadsById);
router.route("/settle-leads").post(settleLeads);
router.route("/get-selected-leads").post(getSelectedLeads);
router.route("/get-selected-leads-by-id").post(getSelectedLeadsById);

module.exports = router;
