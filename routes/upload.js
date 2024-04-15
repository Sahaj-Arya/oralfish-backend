const express = require("express");
const { single } = require("../controllers/upload");
const { upload } = require("../utils/storageUtil");
const router = express.Router();

router.route("/single-image").post(upload.single("image"), () => {});
router.route("/upload-image").post(upload.single("image"), single);

module.exports = router;

//----------- for s3 uploads --------------------//

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
// const upload = multer({ dest: "uploads/" });
//  router.route("/single-image-s3").post(upload.single("image"), single);
