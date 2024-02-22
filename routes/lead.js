const express = require("express");

const { getAllLeads, CreateLead } = require("../controllers/lead");

const router = express.Router();

router.route("/get-all-leads").get(getAllLeads);
router.route("/create-lead").post(CreateLead);

module.exports = router;
