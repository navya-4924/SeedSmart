require('dotenv').config();

console.log('\n📧 ===== EMAIL CONFIG TEST =====\n');
console.log('EMAIL_USER:', JSON.stringify(process.env.EMAIL_USER));
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? `✅ Length: ${process.env.EMAIL_PASS.length}` : '❌ MISSING');
console.log('EMAIL_PASS (first 4 chars):', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 4) + '...' : '❌ N/A');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('PORT:', process.env.PORT);
console.log('\n================================\n');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email verification FAILED:');
    console.log('   Code:', error.code);
    console.log('   Message:', error.message);
    console.log('\n💡 Fix Suggestions:');
    if (error.code === 'EAUTH') {
      console.log('   - App Password is WRONG');
      console.log('   - Make sure 2-Step Verification is ON');
      console.log('   - Generate a NEW App Password');
    }
  } else {
    console.log('✅ Email service is READY!');
    console.log('   You can send emails from:', process.env.EMAIL_USER);
  }
});