const nodemailer = require("nodemailer");
const fs = require("fs");
const { settlement } = require("./template/settlement");

// Function to send email
async function sendEmail(recipient, subject, body) {
  try {
    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: "mail.new-india-consultants.com", // SMTP server hostname
      port: 465, // TCP port to connect to
      secure: true, // true for 465, false for other ports; deprecated, should be false for port 587
      auth: {
        user: "rojgar@new-india-consultants.com", // SMTP username
        pass: "Foodfoodfood1@", // SMTP password
      },
    });

    // Setup email data
    const mailOptions = {
      from: '"Rojgar App" <rojgar@new-india-consultants.com>', // sender address
      to: recipient, // list of receivers
      // subject: subject, // Subject line
      // html: body // HTML body
      subject: "This month's Settlment", // Subject line
      html: settlement, // HTML body
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
