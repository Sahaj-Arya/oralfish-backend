const express = require("express");
const {
  getAllTutorials,
  createTutorial,
  updateTutorial,
  deleteTutorial,
} = require("../controllers/tutorials");

const router = express.Router();

router.route("/get-all-tutorial").get(getAllTutorials);
router.route("/create-tutorial").post(createTutorial);
router.route("/update-tutorial").post(updateTutorial);
router.route("/delete-tutorial").post(deleteTutorial);

module.exports = router;
