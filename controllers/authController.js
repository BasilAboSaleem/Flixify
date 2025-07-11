const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');


exports.signin_get = (req, res) => {
  res.render('pages/front/auth/signin', {
    title: 'Sign In - Flixify',
    description: 'Sign in to your Flixify account to manage your movies and TV shows.',
    keywords: 'signin, login, movies, tv shows, management',
  });
}

exports.signup_get = (req, res) => {
  res.render('pages/front/auth/signup', {
    title: 'Sign Up - Flixify',
    description: 'Create a new Flixify account to start managing your movies and TV shows.',
    keywords: 'signup, register, movies, tv shows, management',
  });
}
exports.signup_post = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // تحقق من وجود الإيميل
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ existEmail: 'Email already exists. Please login.' });
    }

    // تحقق من الفاليديشن
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ objErr: errors.array() });
    }

    // توليد OTP وهاش كلمة السر
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 15 * 60 * 1000;
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      otp,
      otpExpires,
      isVerified: false,
    });

    // حفظ userId في السيشن لمرحلة التحقق
    req.session.userId = newUser._id;

    // إعداد الإيميل
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Flixify – Email Verification Code',
      html: `
        <p>Hello ${name},</p>
        <p>Use the code below to verify your email:</p>
        <h2>${otp}</h2>
        <p>This code expires in 15 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

 
    return res.json({ success: true, redirectTo: '/verify' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.verify_get = (req, res) => {
  res.render('pages/front/auth/verify', {
    title: 'Verify Email - Flixify',
    description: 'Verify your email to complete the signup process on Flixify.',
    keywords: 'verify email, otp, movies, tv shows',
  });
}

exports.forgotPassword_get = (req, res) => {
  res.render('pages/front/auth/forgot-password', {
    title: 'Forgot Password - Flixify',
    description: 'Reset your Flixify password if you have forgotten it.',
    keywords: 'forgot password, reset password, movies, tv shows',
  });
}