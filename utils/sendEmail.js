const nodemailer = require("nodemailer");
const fs = require("fs");
const { settlement } = require("./template/settlement");

// Function to send email
async function sendEmail(
  recipient,
  subject = "This month's Settlment",
  html = settlement
) {
  try {
    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: "mail.rojgarapp.in", // SMTP server hostname
      port: 465, // TCP port to connect to
      secure: true, // true for 465, false for other ports; deprecated, should be false for port 587
      auth: {
        user: "support@rojgarapp.in", // SMTP username
        pass: "Foodfoodfood1@", // SMTP password
      },
    });

    // Setup email data
    const mailOptions = {
      from: '"Rojgar App" <support@rojgarapp.in>',
      to: recipient,
      subject,
      html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent successfully!", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error occurred:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendEmail };
