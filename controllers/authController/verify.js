const {check ,validationResult , bcrypt, crypto, nodemailer, User, jwt} = require('./utils');

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

      return res.json({ success: true, redirectTo: "/signin" }); 
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
