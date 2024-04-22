const express = require("express");
const {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require("../controllers/template");

const router = express.Router();

router.route("/get-all-templates").get(getAllTemplates);
router.route("/create-template").post(createTemplate);
router.route("/update-template").post(updateTemplate);
router.route("/delete-template").post(deleteTemplate);

module.exports = router;
