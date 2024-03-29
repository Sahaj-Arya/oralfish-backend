const account_deletion = (name, url) => {
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Deletion Confirmation</title>
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
              /* Link Styles */
              .confirmation-link {
                color: #007bff;
                text-decoration: none;
              }
              .confirmation-link:hover {
                text-decoration: underline;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <header>
              </header>
              <h1>Account Deletion Confirmation</h1>
              <p>Dear ${capitalizeFirstLetter(name)},</p>
              <p>This email has been sent to confirm the account deletion.</p>
              <p>If you did not initiate this action, please contact us immediately.</p>
              <p>To confirm account deletion, please click <a class="confirmation-link" href="${url}">here</a>.</p>
              <p>Thank you.</p>
              <footer>
                <p>Sincerely,</p>
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

module.exports = { account_deletion };
