const User = require("../models/User");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const { emailAuth } = require("./sendEmail");

async function getAllFCMTokens() {
  try {
    const result = await User.aggregate([
      // Unwind the fcm_token array to get individual tokens
      { $unwind: "$fcm_token" },
      // Project to output only the fcm_token field
      {
        $project: {
          _id: 0,
          fcm_token: 1,
        },
      },
    ]);

    const tokens = result.map((user) => user.fcm_token);
    return tokens;
  } catch (err) {
    throw err;
  }
}

async function generateInvoice(invoice, path) {
  try {
    let doc = new PDFDocument({ margin: 50 });

    generateHeader(doc);
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice);
    generateFooter(doc);

    const fileName = Date.now() + path;

    const writeStream = fs.createWriteStream("../rojgarData/pdfs/" + fileName);
    doc.pipe(writeStream);

    doc.end();

    const transporter = nodemailer.createTransport(emailAuth);
    const mailOptions = {
      from: '"Rojgar App" <support@rojgarapp.in>',
      to: invoice?.shipping?.email,
      subject: "Invoice",
      text: "Please find the attached invoice.",
      attachments: [
        {
          filename: fileName,
          path: "../rojgarData/pdfs/" + fileName,
        },
      ],
    };

    // Send email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    const url = process.env.WEB_URL + `/pdf/${fileName}`;
    return url;
  } catch (error) {
    console.log(error);
  }
}
function generateHeader(doc) {
  doc
    .image(__dirname + "/logo.png", 50, 45, {
      width: 50,
    })
    .fillColor("#444444")
    .fontSize(20)
    .text("Rojgar App Inc.", 110, 57)
    .fontSize(10)
    .text("Janakpuri Main Street", 200, 65, { align: "right" })
    .text("New Delhi, IN, 110025", 200, 80, { align: "right" })
    .moveDown();
}

function generateFooter(doc) {
  doc.fontSize(10).text("Thank you for the business", 50, 700, {
    align: "center",
    width: 500,
  });
}

function generateCustomerInformation(doc, invoice) {
  doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(invoice.invoice_nr, 150, customerInformationTop)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15)
    .text("Balance Due:", 50, customerInformationTop + 30)
    .text(
      formatCurrency(invoice.subtotal - invoice.paid),
      150,
      customerInformationTop + 30
    )

    .font("Helvetica-Bold")
    .text(invoice.shipping.name, 300, customerInformationTop)
    .font("Helvetica")
    .text(invoice.shipping.address, 300, customerInformationTop + 15)
    .text(
      invoice.shipping.city +
        ", " +
        invoice.shipping.state +
        ", " +
        invoice.shipping.country,
      300,
      customerInformationTop + 30
    )
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    // "Description",
    "Unit Cost",
    "Quantity",
    "Line Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.item,
      item.description,
      formatCurrency(item.amount / item.quantity),
      item.quantity,
      formatCurrency(item.amount)
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Subtotal",
    "",
    formatCurrency(invoice.subtotal)
  );

  const paidToDatePosition = subtotalPosition + 20;
  // generateTableRow(
  //   doc,
  //   paidToDatePosition,
  //   "",
  //   "",
  //   "Paid To Date",
  //   "",
  //   formatCurrency(invoice.paid)
  // );

  const duePosition = paidToDatePosition + 25;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "Paid",
    "",
    formatCurrency(invoice.subtotal - invoice.paid)
  );
  doc.font("Helvetica");
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    // .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatCurrency(cents) {
  return "INR " + cents;
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return day + " /" + month + " /" + year.toString().slice(2);
}

function parseDateString(dateString) {
  const [year, month, day] = dateString.split("/").map(Number);
  return new Date(year, month - 1, day);
}

module.exports = { getAllFCMTokens, generateInvoice, parseDateString };
