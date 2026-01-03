const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Validate environment variables
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    throw new Error('Email configuration is incomplete. Please check your environment variables.');
  }

  // Create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports like 587
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Verify the transporter configuration
  try {
    await transporter.verify();
    console.log('SMTP configuration verified successfully');
  } catch (error) {
    console.error('SMTP configuration verification failed:', error);
    throw error;
  }

  // Define email options
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Send email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

module.exports = sendEmail;