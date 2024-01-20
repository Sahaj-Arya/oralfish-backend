require("dotenv").config();
require("express-async-errors");
const cors = require("cors"); // Import the cors middleware
const express = require("express");

const jobsRouter = require("./routes/jobs");
const authRouter = require("./routes/auth");
const notificationRouter = require("./routes/notification");
const uploadRouter = require("./routes/upload");

const { PORT, MONGO_URI } = process.env;

const app = express();
const path = require("path");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const connectDB = require("./db/connect");
const verifyToken = require("./middleware/verifyToken");
const { upload } = require("./controllers/upload");

app.use(express.json());

app.use(cors());

app.get("/", (req, res) => {
  res.send("API working on V1");
});
app.post("/upload", upload.single("profile"), (req, res) => {
  console.log(req.file);
  res.send("API working on V1");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", jobsRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/upload", uploadRouter);

app.use(notFoundMiddleware);
app.use(verifyToken);
app.use(errorHandlerMiddleware);

const port = PORT || 3000;

const start = async () => {
  try {
    await connectDB(MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
