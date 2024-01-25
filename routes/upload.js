const express = require("express");
const multer = require("multer");
const { single } = require("../controllers/upload");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.route("/single-image").post(upload.single("image"), single);

module.exports = router;
