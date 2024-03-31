const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

const imageFolder = "../rojgarData/images";

const getSingleImage = async (req, res) => {
  const id = req.params.id;
  const filePath = path.join(imageFolder, id);
  // console.log(filePath);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // console.log("exists");
    // Serve the file to the user
    res.sendFile(filePath);
  } else {
    // File not found
    res.status(404).send("File not found");
  }
};

module.exports = { getSingleImage };
