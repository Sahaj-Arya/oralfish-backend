require("dotenv").config();
require("express-async-errors");

const cors = require("cors"); // Import the cors middleware
const express = require("express");

const authRouter = require("./routes/auth");
const notificationRouter = require("./routes/notification");
const uploadRouter = require("./routes/upload");
const profileRouter = require("./routes/profile");
const imageRouter = require("./routes/image");
const offerRouter = require("./routes/offers");
const sponsorRouter = require("./routes/sponsor");
const categoryRouter = require("./routes/category");
const orderRouter = require("./routes/order");
const bannerRouter = require("./routes/banner");
const bankRouter = require("./routes/bank");
const leadRouter = require("./routes/lead");
const templateRouter = require("./routes/template");
const tutorialRouter = require("./routes/tutorials");
const paymentRouter = require("./routes/payment");

const { PORT, MONGO_URI } = process.env;

const app = express();

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const connectDB = require("./db/connect");
const verifyToken = require("./middleware/verifyToken");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("<h1>Hello Express!</h1>");
});
app.get("/api/v1/check", (req, res) => {
  res.status(200).json({ message: "Internet connected", status: true });
});

app.use("/image", express.static("../rojgarData/images"));
app.use("/pdf", express.static("../rojgarData/pdfs"));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/offers", offerRouter);
app.use("/api/v1/sponsor", sponsorRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/banner", bannerRouter);
app.use("/api/v1/bank", bankRouter);
app.use("/api/v1/lead", leadRouter);
app.use("/api/v1/template", templateRouter);
app.use("/api/v1/tutorial", tutorialRouter);
app.use("/image", imageRouter);

app.use(notFoundMiddleware);
app.use(verifyToken);
app.use(errorHandlerMiddleware);

const port = PORT || 3000;

const start = async () => {
  try {
    console.log(MONGO_URI);
    await connectDB(MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
