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
    subject: 'Activate Your ClipIt Account!',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #4CAF50; text-align: center;">Welcome to ClipIt!</h1>
        <img src="http://localhost:3001/public/Untitled.png" alt="ClipIt Logo" style="display: block; margin: 20px auto; width: 50%;">
        <p>Hi there!</p>
        <p>We're thrilled to have you on board. ClipIt is your new companion in revolutionizing social media content creation. Let's get your email verified to kickstart an amazing journey!</p>
        <a href="${confirmationUrl}" style="background-color: #4CAF50; color: white; padding: 15px 25px; text-align: center; text-decoration: none; display: block; margin: 20px auto; width: fit-content; border-radius: 5px; font-weight: bold;">Activate Account</a>
        <p style="text-align: center;">Just one click away from starting with ClipIt!</p>
        <p>If you didn't sign up for ClipIt, you can safely ignore this email, or <a href="https://www.cliplt.com/support">contact our support team</a> for assistance.</p>
        <footer style="margin-top: 30px; text-align: center;">
          <p><small>© ${new Date().getFullYear()} ClipIt. All rights reserved.</small></p>
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
