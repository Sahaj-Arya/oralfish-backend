const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../aws/S3");

const single = async (req, res) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: req.file.originalname,
    Body: req.file.buffer,
    Content: req.file.mimetype,
  };

  s3.send(new PutObjectCommand(params))
    .then((e) => {
      console.log(e, "data");
      res.status(200).send({
        message: "Uploaded",
        url:
          "https://oralfish-uploads.s3.ap-south-1.amazonaws.com" + params.Key,
      });
    })
    .catch((e) => console.log(e));
};

module.exports = { single };
