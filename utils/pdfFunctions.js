const PDFDocument = require("pdfkit");
const fs = require("fs");
const nodemailer = require("nodemailer");

// Generate the invoice PDF
async function generateInvoiceNew(invoice, path) {
  try {
    const doc = new PDFDocument({ margin: 50 });

    // Generate the PDF structure
    generateHeader(doc);
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice);
    generateFooter(doc);

    const fileName = `${Date.now()}${path}`;
    const filePath = `../rojgarData/pdfs/${fileName}`;

    // Save the PDF to a file
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);
    doc.end();

    // Wait for the PDF to finish writing before proceeding
    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    // Configure the email transporter
    const transporter = nodemailer.createTransport(emailAuth);

    // Set up the email options
    const mailOptions = {
      from: '"Rojgar App" <support@rojgarapp.in>',
      to: invoice?.shipping?.email,
      subject: "Invoice",
      text: "Please find the attached invoice.",
      attachments: [
        {
          filename: fileName,
          path: filePath,
        },
      ],
    };

    // Send the email with the attached invoice
    await transporter.sendMail(mailOptions);

    // Return the URL where the invoice can be accessed
    const url = `${process.env.WEB_URL}/pdf/${fileName}`;
    return url;
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw error; // Rethrow the error for further handling if needed
  }
}

// Helper functions to generate parts of the PDF
function generateHeader(doc) {
  doc.fontSize(20).text("Invoice", { align: "center" }).moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc
    .fontSize(12)
    .text(`Invoice Number: ${invoice.invoiceNumber}`)
    .text(`Date: ${invoice.date}`)
    .moveDown()
    .text(`Customer Name: ${invoice.customerName}`)
    // .text(`Address: ${invoice.shipping.address}`)
    .moveDown();
}

function generateInvoiceTable(doc, invoice) {
  doc.fontSize(12).text("Order Details", { underline: true }).moveDown();

  const tableTop = doc.y;
  const titleX = 50,
    clickIdX = 150,
    earningX = 250,
    createdX = 350;

  // Table Headers
  doc.text("Title", titleX, tableTop);
  doc.text("Click ID", clickIdX, tableTop);
  doc.text("Earning", earningX, tableTop);
  doc.text("Created Date", createdX, tableTop);

  // Table Rows
  invoice.orders.forEach((order, i) => {
    const rowY = tableTop + 20 + i * 20;
    doc.text(order.title, titleX, rowY);
    doc.text(order.click_id, clickIdX, rowY);
    doc.text(`$${parseFloat(order.earning).toFixed(2)}`, earningX, rowY);
    doc.text(new Date(order.created).toLocaleDateString(), createdX, rowY);
  });

  // Total Amount
  doc.moveDown();
  const totalEarnings = invoice.orders.reduce(
    (sum, order) => sum + parseFloat(order.earning),
    0
  );
  doc.text(`Total Earnings: $${totalEarnings.toFixed(2)}`, { align: "right" });
}

function generateFooter(doc) {
  doc
    .moveDown()
    .fontSize(12)
    .text("Thank you for your business!", { align: "center" });
}

module.exports = generateInvoiceNew;
