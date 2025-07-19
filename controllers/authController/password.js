const {check ,validationResult , bcrypt, crypto, nodemailer, User, jwt} = require('./utils');


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
