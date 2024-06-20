const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const { StatusCodes } = require("http-status-codes");
const { compress } = require("pdfkit");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../rojgarData/images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname.replace(" ", "_"));
  },
});

const upload = multer({ storage: storage });

const uploadAndCompressImage = (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Image Upload Failed",
        success: false,
        error: err.message,
      });
    }

    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "No file provided",
        success: false,
      });
    }

    const filePath = path.join(req.file.destination, req.file.filename);
    const compressedFilePath = path.join(
      req.file.destination,
      "c_" + req.file.filename
    );

    try {
      let compress = 5;
      if (req.body.compress) {
        compress = req.body.compress;
      }
      const metadata = await sharp(filePath).metadata();
      const newWidth = Math.floor(metadata.width * Math.sqrt(1 / compress));
      const newHeight = Math.floor(metadata.height * Math.sqrt(1 / compress));

      await sharp(filePath)
        .resize(newWidth, newHeight)
        .toFile(compressedFilePath);
      //  delete the original file
      fs.unlinkSync(filePath);

      req.file.path = compressedFilePath;
      req.file.filePath = compressedFilePath;
      req.file.filename = "c_" + req.file.filename; // console.log(req.file);
      next();
    } catch (compressionErr) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Image compression failed",
        success: false,
        error: compressionErr.message,
      });
    }
  });
};

module.exports = { upload, uploadAndCompressImage };
