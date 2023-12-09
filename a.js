app.post("/default/soul/addMovingTextToVideo", async (req, res) => {
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
    const outputVideoPath = `/tmp/${convertedVideoFileName}`;

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
        // Display text for 2 seconds, then hide for 1 second, and repeat
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
        // {
        //     filter: 'drawtext',
        //     options: {
        //         text: "text2222",
        //         fontfile: 'arial.ttf',
        //         fontsize: 24,
        //         fontcolor: 'white',
        //         x: if(lt(mod(t,${textTx1}),${textTx2}), ${textX}+10*t-30, NAN),
        //         y: if(lt(mod(t,${textTy1}),${textTy2}), ${textY}+10, NAN),
        //     },
        // },
      ])

      .output(outputVideoPath)
      .on("end", async () => {
        // Assuming you have AWS SDK and S3 configured
        let videoUrl = await uploadVideoToS3(
          outputVideoPath,
          `convertedVideos/${convertedVideoFileName}`
        );

        // Clean up local files if needed
        // fs.unlinkSync(inputVideoPath);
        // fs.unlinkSync(outputVideoPath);

        res.status(200).json({ videoUrl: videoUrl });
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
