const {check ,validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
var jwt = require("jsonwebtoken");



exports.signin_get = (req, res) => {
  res.render('pages/front/auth/signin', {
    title: 'Sign In - Flixify',
    description: 'Sign in to your Flixify account to manage your movies and TV shows.',
    keywords: 'signin, login, movies, tv shows, management',
  });
}

exports.signin_post = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ error: "Email or password is incorrect" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.json({ error: "Email or password is incorrect" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWTSECRET_KEY);
    res.cookie('jwt', token, { httpOnly: true, maxAge: 86400000 });

    // فحص التحقق من البريد
    if (!user.isVerified) {
      req.session.userId = user._id;
      return res.json({ success: true, redirectTo: "/verify" });
    }

    return res.json({ success: true, redirectTo: "/" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};


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

exports.verify_get = async (req, res) => {
    // تأكد أن المستخدم موجود في السيشن
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized: No session available');
  }

  try { 
    // جلب بيانات المستخدم من الداتا بيز حسب الـ ID المحفوظ في السيشن
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    if (user.isVerified) {
      return res.redirect('/login');
    }
  res.render('pages/front/auth/verify', {
    title: 'Verify Email - Flixify',
    description: 'Verify your email to complete the signup process on Flixify.',
    keywords: 'verify email, otp, movies, tv shows',

  });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
};

exports.verify_post = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No session available' });
  }

  if (req.session.otpBlockedUntil && Date.now() < req.session.otpBlockedUntil) {
    return res.json({ success: false, blocked: true, message: 'Too many attempts. Please try again later.' });
  }

  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.otp === user.otp && Date.now() < user.otpExpires) {
      user.isVerified = true;
      user.otp = null;
      user.otpExpires = null;
      await user.save();

      // Clear session
      req.session.userId = null;
      req.session.otpAttempts = 0;
      req.session.otpBlockedUntil = null;

      return res.json({ success: true, redirectTo: "/signin" }); // أو أي صفحة تريدها
    } else {
      req.session.otpAttempts = (req.session.otpAttempts || 0) + 1;

      if (req.session.otpAttempts >= 5) {
        req.session.otpBlockedUntil = Date.now() + 15 * 60 * 1000; // 15 دقيقة حظر
      }

      return res.json({ success: false, invalidOtp: true, message: 'Invalid or expired OTP' });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.resend_verify_post = async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/signin");
  }

  // منع الإرسال المتكرر خلال دقيقة واحدة
  if (req.session.lastOtpSent && Date.now() - req.session.lastOtpSent < 60 * 1000) {
    req.flash('error', 'Please wait before requesting a new verification code.');
    return res.redirect('/verify');
  }

  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/verify');
    }

    if (user.isVerified) {
      req.flash('error', 'User is already verified.');
      return res.redirect('/signin');
    }

    // توليد رمز جديد وتحديثه في المستخدم
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 15 * 60 * 1000;

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    req.session.lastOtpSent = Date.now();

    // إعداد البريد
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Flixify – New Verification Code",
      html: `
        <p>Hello ${user.name},</p>
        <p>Here is your new verification code:</p>
        <h2>${otp}</h2>
        <p>This code will expire in 15 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    req.flash('success', 'A new verification code has been sent to your email.');
     return res.redirect('/verify');

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

exports.logout_get = (req, res) => {
  res.clearCookie('connect.sid');
  res.clearCookie('jwt');
  res.redirect('/signin');
};

exports.forgot_password_get = (req, res) => {
  res.render('pages/front/auth/forgot-password', {
    title: 'Forgot Password - Flixify',
    description: 'Reset your Flixify password if you have forgotten it.',
    keywords: 'forgot password, reset password, movies, tv shows',
  });
};

exports.forgotPassword_post = async (req, res) => {
  try {
    const { email } = req.body;

    // تحقق من وجود الإيميل
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No account with that email found." });
    }

    // إنشاء توكن عشوائي
    const resetToken = crypto.randomBytes(32).toString("hex");

    // إعداد صلاحية التوكن 15 دقيقة
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    // إعداد رابط إعادة تعيين كلمة المرور
    const resetUrl = `http://${req.headers.host}/reset-password/${resetToken}`;

    // إرسال الإيميل 
    const transporter = nodemailer.createTransport({
      service: "Gmail", 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: "Flixify <no-reply@flixify.com>",
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to set a new password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "Reset link sent to your email." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

exports.reset_password_get = async (req, res) => {
  const token = req.params.token;

  if (!token) {
    req.flash('error', 'Invalid or missing token');
    return res.redirect('/forgot-password');
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, 
    });

    if (!user) {
      req.flash('error', 'Invalid or expired token');
      return res.redirect('/forgot-password');
    }

    // إرسال التوكن للرندر لاستخدامه في الفورم
    res.render('pages/front/auth/reset-password', { token });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.reset_password_post = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const token = req.params.token;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
   //تشفير كلمة السر
     const hashedPassword = await bcrypt.hash(password, 12);
     user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successfully' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

