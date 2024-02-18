const single = async (req, res) => {
  console.log(req.file);
  res.send("Image uploaded successfully!");
};

module.exports = { single };
