const { StatusCodes } = require("http-status-codes");

const single = async (req, res) => {
  if (!req.file) {
    return res.status(StatusCodes.BAD_REQUEST).send({
      message: "Image Upload Failed?. No file Provided",
      success: false,
    });
  }

  if (req?.file) {
    image = process.env.WEB_URL + "/image/" + req.file.filename;
  }
  if (!image) {
    return res.status(StatusCodes.CONFLICT).send({
      message: "Unknown error occured",
      success: false,
    });
  }

  // console.log(image);
  return res.status(StatusCodes.CREATED).send({
    image,
    message: "Image Uploaded successfully",
    success: true,
  });
};

module.exports = { single };
