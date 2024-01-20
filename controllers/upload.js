const multer = require("multer");
const path = require("path");

const upload = multer({
  dest: "./upload/images",
});

const single = async (req, res) => {
  console.log("single upload");
  console.log(req.body);
};

module.exports = { single, upload };
