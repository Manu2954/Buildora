const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const { getWelcomeEmailHTML } = require('../utils/emailTemplates');
const sendEmail = require('../utils/sendEmail');

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        // --- THE FIX IS HERE ---
        // We now use parseInt() to ensure JWT_COOKIE_EXPIRE is a number.
        // This prevents the calculation from resulting in an invalid date.
        expires: new Date(
            Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true // The cookie cannot be accessed by client-side scripts
    };
    
    // In production, the cookie should only be sent over HTTPS
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options) // Optional: set token in a cookie
        .json({
            success: true,
            message,
            token, // Send token in the body as well for mobile clients
            data: { // Send back non-sensitive user data
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
};

// You would then call this from your login, register, and updatePassword functions, for example:
// sendTokenResponse(user, 200, res, "Password updated successfully");



// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.signup = async (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = jwt.sign({ email }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            verificationToken, // Store the token if you verify it on the backend
        });

        const verificationLink = `http://localhost:3000/verify?token=${verificationToken}`;

        // --- THIS IS THE KEY CHANGE ---
        // Send the verification email using the new, reusable utility
        await sendEmail({
            to: email,
            subject: 'Verify your Buildora account',
            html: `<p>Welcome to Buildora! Please click the link below to verify your account.</p><p><a href="${verificationLink}">Verify Account</a></p>`
        });

        // Send WhatsApp (optional, as before)
          // Send WhatsApp
    if (phone) {
      console.log('Attempting to send WhatsApp to:', phone);
      await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${phone}`,
        body: `Welcome to Buildora! Click the link to verify your account: ${verificationLink}`
      });
      console.log('WhatsApp sent successfully:', phone);
    }

        res.status(200).json({ message: 'Verification link sent to your email.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Signup failed' });
    }
};


exports.verify = async (req, res) => {
  const { token } = req.query;
  console.log('entered')
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findOne({ email: decoded.email });
  console.log('user found')

    if (!user || user.isVerified || user.verificationToken !== token) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.tokenExpiry = null;
    await user.save();
  console.log('user verified')
    
   try {
        await sendEmail({
            email: user.email,
            subject: 'Welcome to Buildora!',
            html: getWelcomeEmailHTML(user)
        });
    } catch (err) {
        console.error("Failed to send welcome email:", err);
        // Do not block the user flow if email fails
    }

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Token is invalid or expired' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

// console.log(req.body);
// console.log(req.body.password);
  try {
    const user = await User.findOne({ email });
    // console.log(user);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email first' });

    const isMatch = await bcrypt.compare(password, user.password);
    // console.log(isMatch)
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
    );

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })
      .json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: `Login failed ${err}` });
  }
};

exports.refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Refresh token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
    );

    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

const crypto = require('crypto');

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    const resetLink = `https://buildora.com/reset-password?token=${token}&email=${email}`;

    // Send email
    await transporter.sendMail({
      to: email,
      subject: 'Buildora Password Reset',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 15 minutes.</p>`
    });

    // Send WhatsApp
    if (user.phone) {
      await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${user.phone}`,
        body: `Buildora password reset: ${resetLink}`
      });
    }

    res.json({ message: 'Reset link sent to email and WhatsApp' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to initiate reset' });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  try {
    const user = await User.findOne({ email, resetPasswordToken: token });
    if (!user || user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: 'Token is invalid or expired' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetPasswordToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Reset failed' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });
  res.json({ message: 'Logged out successfully' });
};

exports.getMe = asyncHandler(async (req, res, next) => {
    // The `protect` middleware runs before this, decodes the token,
    // finds the user, and attaches it to the request object as `req.user`.
    
    // We can just send back the user object from the request.
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});


exports.updateDetails = asyncHandler(async (req, res, next) => {
    // Fields that the user is allowed to update
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
        address: req.body.address
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });
    
    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    
    // Get user from the database, making sure to select the password field
    const user = await User.findById(req.user.id).select('+password');

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
        return next(new ErrorResponse('The current password is incorrect', 401));
    }
    
    // Set new password
    user.password = newPassword;
    await user.save();
    
    // Send a new token as good practice after a password change
    sendTokenResponse(user, 200, res, "Password updated successfully");
});

