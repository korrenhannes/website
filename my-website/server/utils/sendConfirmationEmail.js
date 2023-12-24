const nodemailer = require('nodemailer');

async function sendConfirmationEmail(email, confirmationCode) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const confirmationUrl = `https://www.cliplt.com/confirm/${confirmationCode}`;
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Confirm Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #1a1a1a;">Welcome to OurApp!</h2>
        <p>Hi there,</p>
        <p>We are excited to have you on board. To get started with OurApp, please confirm your email address. This ensures that we have your correct email address and can contact you with important information about your account and our services.</p>
        <a href="${confirmationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; margin-top: 10px; border-radius: 5px;">Confirm Email</a>
        <p>If you did not sign up for an OurApp account, please ignore this email or <a href="#">contact support</a> if you have any concerns.</p>
        <footer>
          <p>Thank you for choosing OurApp!</p>
          <p>If the button above does not work, copy and paste the following link into your browser:</p>
          <a href="${confirmationUrl}" style="color: #4CAF50;">${confirmationUrl}</a>
        </footer>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to', email);
  } catch (error) {
    console.error('Error sending confirmation email to', email, ':', error);
  }
}

module.exports = sendConfirmationEmail;
