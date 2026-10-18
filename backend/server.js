require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail, verifyEmailConfig } = require('./src/services/emailService');
const { Op } = require('sequelize');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
sequelize.authenticate()
  .then(() => console.log('✅ Database connected!'))
  .catch(err => console.log('❌ Database error:', err.message));

// Sync models (create tables)
sequelize.sync({ alter: true })
  .then(() => console.log('✅ Tables created!'))
  .catch(err => console.log('❌ Sync error:', err.message));

// Test email service (REVEALS REAL ERROR)
verifyEmailConfig()
  .then(success => {
    if (success) {
      console.log('✅ Email service ready!');
    } else {
      console.log('⚠️  Email service NOT ready - check .env credentials');
    }
  })
  .catch(err => console.log('❌ Email error:', err.message));

// REGISTER API
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, phone, village } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists!' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      village
    });

    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// LOGIN API
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: '🌾 SeedSmart Backend is running!' });
});

// ============================================
// FORGOT PASSWORD API
// ============================================
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Security: Don't reveal if email exists
      return res.json({ 
        message: 'If this email exists, a reset link has been sent.' 
      });
    }

    // Check if Google user (no password)
    if (!user.password) {
      return res.status(400).json({ 
        message: 'This account uses Google Sign-In. Please use Google to login.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save to database (expires in 1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // Send email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
      res.json({ 
        message: 'Password reset link sent to your email!' 
      });
    } catch (emailError) {
      // If email fails, reset the token
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
      
      console.error('Email error:', emailError);
      return res.status(500).json({ 
        message: 'Error sending email. Please try again.' 
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// RESET PASSWORD API
// ============================================
app.post('/api/auth/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Hash the token to compare
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token and not expired
    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Hash new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.json({ 
      message: 'Password reset successful! You can now login.' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// VERIFY RESET TOKEN API
// ============================================
app.get('/api/auth/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Invalid or expired token' 
      });
    }

    res.json({ valid: true, email: user.email });
  } catch (error) {
    res.status(500).json({ valid: false, message: error.message });
  }
});

// ============================================
// GOOGLE LOGIN API
// ============================================
app.post('/api/auth/google-login', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Create new user (no password since Google auth)
      user = await User.create({
        name: name,
        email: email,
        password: null,
        googleId: googleId,
        village: null,
        phone: null
      });
    } else if (!user.googleId) {
      // Existing user with email/password — link Google account
      user.googleId = googleId;
      await user.save();
    }

    // Create SeedSmart JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: picture
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ 
      message: 'Google authentication failed', 
      error: error.message 
    });
  }
});

// ============================================
// DISEASE DETECTION API
// ============================================

// Create uploads folder
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  }
});

// Disease detection endpoint
app.post('/api/disease/detect', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    console.log('📸 Image received:', req.file.filename);

    // Forward image to Python AI service
    const formData = new FormData();
    formData.append('image', fs.createReadStream(req.file.path));

    const response = await axios.post(
      'http://localhost:5002/predict',
      formData,
      { 
        headers: formData.getHeaders(),
        maxBodyLength: Infinity,
        timeout: 30000
      }
    );

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    console.log('✅ Prediction:', response.data.disease);

    res.json(response.data);

  } catch (error) {
    console.error('❌ Disease detection error:', error.message);

    // Clean up file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: 'Error detecting disease',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` SeedSmart Backend is ready!`);
});