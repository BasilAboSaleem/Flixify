const {check ,validationResult , bcrypt, crypto, nodemailer, User, jwt} = require('./utils');


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
    if (user.role === 'admin') {
      return res.json({ success: true, redirectTo: "/admin/dashboard" });
    }

    return res.json({ success: true, redirectTo: "/" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
