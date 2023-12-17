// utils/sendConfirmationEmail.js

const nodemailer = require('nodemailer');

async function sendConfirmationEmail(email, confirmationCode) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use the email service you prefer
    auth: {
        user: process.env.EMAIL_USERNAME, // Your email address
        pass: process.env.EMAIL_PASSWORD, // Your email password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME, // Sender's email address
    to: email, // Recipient's email address
    subject: 'Confirmation Email',
    text: `Please confirm your email address by clicking on this link: http://yourapp.com/confirm/${confirmationCode}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent');
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

module.exports = sendConfirmationEmail;
