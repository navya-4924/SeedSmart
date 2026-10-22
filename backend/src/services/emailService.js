const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });


const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendPasswordResetEmail = async (email, resetToken, userName) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"SeedSmart" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🌾 SeedSmart - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: #16a34a; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🌾 SeedSmart</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937;">Hello ${userName},</h2>
          
          <p style="color: #4b5563; font-size: 16px;">
            We received a request to reset your SeedSmart password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #16a34a; color: white; padding: 14px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold; 
                      display: inline-block;">
              Reset My Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Or copy this link into your browser:
          </p>
          <p style="color: #16a34a; font-size: 12px; word-break: break-all;">
            ${resetUrl}
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 14px;">
            ⏰ This link will expire in <strong>1 hour</strong>.
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request this, please ignore this email. Your password won't change.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Happy Farming! 🌱<br>
            <strong>Team SeedSmart</strong>
          </p>
        </div>
        
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
          © 2026 SeedSmart · Kadapa, Andhra Pradesh
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service ready!');
    return true;
  } catch (error) {
    console.log('❌ Email service error:', error.message);
    return false;
  }
};