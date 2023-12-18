const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Replace with your email provider
    auth: {
      user: process.env.EMAIL_USERNAME, // Your email address
      pass: process.env.EMAIL_PASSWORD, // Your email password
    },
  });

  // Define the email options
  const mailOptions = {
    from: process.env.EMAIL_USERNAME, // Sender address
    to: options.to, // List of receivers
    subject: options.subject, // Subject line
    text: options.text, // Plain text body
    html: options.html, // HTML body (optional)
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
