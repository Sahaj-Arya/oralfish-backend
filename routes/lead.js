const express = require("express");

const {
  getAllLeads,
  CreateLead,
  getLeadsById,
} = require("../controllers/lead");

const router = express.Router();

router.route("/get-all-leads").get(getAllLeads);
router.route("/create-lead").post(CreateLead);
router.route("/get-leads-by-id").post(getLeadsById);

module.exports = router;
