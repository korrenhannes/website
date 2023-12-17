const nodemailer = require('nodemailer');

async function sendConfirmationEmail(email, confirmationCode) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use the email service you prefer
    auth: {
      user: process.env.EMAIL_USERNAME, // Your email address
      pass: process.env.EMAIL_PASSWORD, // Your email password
    },
  });

  const confirmationUrl = `http://localhost:3000/confirm/${confirmationCode}`; // Replace with your actual frontend route
  const mailOptions = {
    from: process.env.EMAIL_USERNAME, // Sender's email address
    to: email, // Recipient's email address
    subject: 'Confirmation Email',
    text: `Please confirm your email address by clicking on this link: ${confirmationUrl}`,
    html: `<p>Please confirm your email address by clicking on the link below:</p><a href="${confirmationUrl}">${confirmationUrl}</a>`, // HTML body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to', email);
  } catch (error) {
    console.error('Error sending confirmation email to', email, ':', error);
  }
}

module.exports = sendConfirmationEmail;
