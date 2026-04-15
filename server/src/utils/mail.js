import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter;
}

export async function sendOrderEmail({ to, customerName, orderNumber, total, items }) {
  const mailer = getTransporter();

  if (!mailer) {
    return { status: "skipped" };
  }

  const productList = items
    .map((item) => `${item.product_name || item.name} x ${item.quantity} - Rs. ${Number(item.line_total || (Number(item.price) * item.quantity)).toFixed(2)}`)
    .join("\n");

  await mailer.sendMail({
    from: process.env.SMTP_FROM || "Flipkart Clone <no-reply@flipkartclone.dev>",
    to,
    subject: `Order confirmed: ${orderNumber}`,
    text: `Hi ${customerName}, your order ${orderNumber} has been placed.\n\nItems:\n${productList}\n\nTotal: Rs. ${Number(total).toFixed(2)}`
  });

  return { status: "sent" };
}

