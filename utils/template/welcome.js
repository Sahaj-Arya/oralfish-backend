const welcomeEmail = (name, email) => {
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Our Platform</title>
          <style>
            /* Reset CSS */
            body,
            h1,
            p {
              margin: 0;
              padding: 0;
            }
            body {
              font-family: Arial, sans-serif;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #333;
              margin-bottom: 20px;
              text-align: center;
            }
            p {
              color: #666;
              line-height: 1.5;
              margin-bottom: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <header>
              </header>
            <h1>Welcome to Our Platform</h1>
            <p>Dear ${capitalizeFirstLetter(name)},</p>
            <p>
              Welcome to our platform! We are thrilled to have you on board and look forward to serving you.
            </p>
            <p>
              [Optional: Include a brief overview of what the recipient can expect from the platform or any special benefits.]
            </p>
            <p>If you have any questions or need assistance, feel free to reach out to us at ${email}.</p>
            <p>Once again, welcome aboard!</p>
            <footer>
              <p>Best Regards,</p>
              <p>[Your Company Name]</p>
              <p>[Website URL]</p>
              <p>[Email Address]</p>
              <p>[Phone Number]</p>
              <p>This is an automated email. Please do not reply.</p>
            </footer>
          </div>
        </body>
      </html>
    `;
};

module.exports = { welcomeEmail };
