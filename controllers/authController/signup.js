const {check ,validationResult , bcrypt, crypto, nodemailer, User, jwt} = require('./utils');


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