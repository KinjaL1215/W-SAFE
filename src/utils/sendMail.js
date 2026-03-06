const nodemailer = require('nodemailer');

async function sendMail(recipients, message) {
  // recipients: array of email strings OR comma-separated string
  if (!recipients) return;

  const to = Array.isArray(recipients) ? recipients.join(',') : recipients;

  // If no email credentials are provided, log and return (development fallback)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('EMAIL_USER/EMAIL_PASS not set — skipping real email send.');
    console.log('Would send to:', to);
    console.log('Message:', message);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: '🚨 W-SAFE Emergency Alert',
    text: message
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendMail;
