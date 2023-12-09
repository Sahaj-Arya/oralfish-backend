require("dotenv").config();
require("express-async-errors");

const { Readable } = require("stream");
const fs = require("fs");
const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const mydisk = "/Users/sahajarya/video/";
// Tell fluent-ffmpeg where it can find FFmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);

// const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
// const ffmpeg = require("fluent-ffmpeg");
// ffmpeg.setFfmpegPath(ffmpegPath);

const express = require("express");

const jobsRouter = require("./routes/jobs");
const authRouter = require("./routes/auth");

const { PORT, MONGO_URI } = process.env;
const app = express();
const path = require("path");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const connectDB = require("./db/connect");

app.use(express.json());
// extra packages

// routes
app.get("/", (req, res) => {
  res.send("jobs api");
});

app.post("/", (req, res) => {
  res.send("jobs api");
});

app.post("/video", async (req, res) => {
  try {
    const {
      text,
      userID,
      videoURL,
      taggedUsers,
      textXcord = 100,
      textYcord = 500,
      textXT1 = 3,
      textXT2 = 2,
      textYT1 = 3,
      textYT2 = 2,
    } = req.body;

    // Generate a random number for the converted video file name
    const randomNum = Math.floor(Math.random() * 10000); // Adjust the range as needed
    const convertedVideoFileName = `${userID}_${randomNum}_output.mp4`;

    // Construct the full path to the video
    // const videoName = 'SampleVideo_1280x720_1mb.mp4';
    // const currentDir = __dirname;
    // const videoURL = "https://static-content-for-text.s3.amazonaws.com/Amazing+Cat+videos+%23cat+%23cats+%23catsoftiktok+%23catlovers+%23catvideo+%23viral+%23tiktok+%23trend+%23shorts.mp4";//path.join(currentDir, videoName);

    // const videoURL = "https://static-content-for-text.s3.amazonaws.com/African+boy+crying+then+laughing+meme%F0%9F%98%82.mp4";
    // Define the local paths for input and output videos
    const inputVideoPath = "/tmp/inputVideo.mp4";
    // const outputVideoPath = `/tmp/${convertedVideoFileName}`;
    const outputVideoPath = `${mydisk}${convertedVideoFileName}`;

    // Assuming you have AWS SDK and S3 configured
    // await downloadVideoFromS3(videoURL, inputVideoPath);
    const textX = textXcord; // Adjust the X-coordinate
    const textY = textYcord; // Adjust the Y-coordinate

    const textTx1 = textXT1;
    const textTx2 = textXT2;
    const textTy1 = textYT1;
    const textTy2 = textYT2;

    // Use fluent-ffmpeg to add text to the video with dynamic movement
    ffmpeg()
      .input(videoURL) // Specify the input video file
      .complexFilter([
        {
          filter: "drawtext",
          options: {
            text: "llklklklklklklklkl99999999999999999999999hgvyfytduhijhbvgfdtre567tyuhjbgvfcdtreyguh",
            fontfile: "arial.ttf",
            fontsize: 24,
            fontcolor: "red",
            x: `if(lt(mod(t,${textTx1}),${textTx2}), ${textX}+10*t-30, NAN)`,
            y: `if(lt(mod(t,${textTy1}),${textTy2}), ${textY}+10, NAN)`,
          },
        },
      ])
      // .complexFilter([
      //   {
      //     filter: "drawtext",
      //     options: {
      //       text: "ygtrdsrdfghjkky6yt67676767667",
      //       fontfile: "arial.ttf",
      //       fontsize: 24,
      //       fontcolor: "white",
      //       x: `if(lt(mod(t,${textTx1}),${textTx2}), ${textX}+10*t-30, NAN)`,
      //       y: `if(lt(mod(t,${textTy1}),${textTy2}), ${textY}+10, NAN)`,
      //     },
      //   },
      // ])

      .output(outputVideoPath)
      .on("end", async () => {
        const randomNum1 = Math.floor(Math.random() * 10000); // Adjust the range as needed
        const convertedVideoFileName1 = `${userID}_${randomNum1}_output.mp4`; // const outputVideoPath = `/tmp/${convertedVideoFileName}`;
        const outputVideoPath1 = `${mydisk}${convertedVideoFileName1}`;
        // Assuming you have AWS SDK and S3 configured
        // let videoUrl = await uploadVideoToS3(
        //   outputVideoPath,
        //   `convertedVideos/${convertedVideoFileName}`
        // );

        // Clean up local files if needed
        // fs.unlinkSync(inputVideoPath);
        // fs.unlinkSync(outputVideoPath);

        // Use fluent-ffmpeg to add text to the video with dynamic movement
        ffmpeg()
          .input(outputVideoPath) // Specify the input video file
          .complexFilter([
            {
              filter: "drawtext",
              options: {
                text: "llklklklklklklklkl99999999999999999999999hgvyfytduhijhbvgfdtre567tyuhjbgvfcdtreyguh",
                fontfile: "arial.ttf",
                fontsize: 45,
                fontcolor: "green",
                x: `if(lt(mod(t,${textTx1}),${textTx2}), ${textX}+10*t-30, NAN)`,
                y: `if(lt(mod(t,${textTy1}),${textTy2}), ${textY}+10, NAN)`,
              },
            },
          ])
          .output(outputVideoPath1)
          .on("end", async () => {
            res.status(200).json({ videoUrl: outputVideoPath1 });
          })
          .run();
      })
      .on("error", (err) => {
        console.error("Error adding text to video:", err);
        res.status(500).json({ error: "Failed to process video." });
      })
      .run();
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
  }
});

app.post("/default/soul/addMoveTextToVideo", async (req, res) => {
  try {
    const { userID } = req.body;

    // Generate a random number for the converted video file name
    const randomNum = Math.floor(Math.random() * 10000); // Adjust the range as needed
    const convertedVideoFileName = `${userID}_${randomNum}_output.mp4`;

    // Construct the full path to the video
    const videoName = "SampleVideo_1280x720_1mb.mp4";
    const currentDir = __dirname;
    const videoURL = path.join(currentDir, videoName);

    // Define the local paths for input and output videos
    const outputVideoPath = `/Users/sahajarya/${convertedVideoFileName}`;

    // Dynamic text generation function
    const dynamicTextFunction = (t) => {
      if (t % 2 < 1) {
        return "Text1";
      } else if (t % 4 < 3) {
        return "Text2";
      } else {
        return "Text3";
      }
    };

    // Use fluent-ffmpeg to add text to the video with dynamic movement
    ffmpeg()
      .input(
        "https://static-content-for-text.s3.amazonaws.com/convertedVideos/1234560987644421_1171_output.mp4"
      ) // Specify the input video file
      .complexFilter([
        // Display dynamic text based on time
        {
          filter: "drawtext",
          options: {
            text: "dynamicTextFunction",
            fontfile: "arial.ttf",
            fontsize: 24,
            fontcolor: "white",
            x: "100+10*t-30",
            y: "50+10",
            enable: "between(t,0,5)",
          },
        },
      ])
      .output(outputVideoPath)
      .on("end", async () => {
        res.status(200).json({ videoUrl: outputVideoPath });
      })
      .on("error", (err) => {
        console.error("Error adding text to video:", err);
        res.status(500).json({ error: "Failed to process video." });
      })
      .run();
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
  }
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", jobsRouter);

app.use(notFoundMiddleware);
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
