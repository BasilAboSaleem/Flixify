const {axios, Movie, Review, User, Settings, Watchlist, seedMovies, fs, path, multer, upload, cloudinary, e} = require('./utils');



exports.admin_dashboard_get = async (req, res) => {
  try {
    // جلب بيانات أساسية
    const [totalMovies, totalUsers] = await Promise.all([
      Movie.countDocuments(),
      User.countDocuments()
    ]);

    // جلب عدد التعليقات اللي فيها comment سواء كانت من مستخدمين محليين أو مستوردة (في مودل Review)
    // شرط user موجود يعني تعليق محلي، شرط user غير موجود يعني تعليق من API (مستورد)
    const totalComments = await Review.countDocuments({ comment: { $exists: true, $ne: null, $ne: '' } });
    const localComments = await Review.countDocuments({ comment: { $exists: true, $ne: null, $ne: '' }, user: { $ne: null } });

    // جلب عدد التقييمات اللي فيها rating سواء محلية أو مستوردة (نفس الفكرة)
    const localReviews = await Review.countDocuments({ rating: { $ne: null }, user: { $ne: null } });

    res.render('pages/dashboard', {
      title: 'Dashboard - Flixify',
      description: 'Manage your movies and TV shows on Flixify.',
      keywords: 'dashboard, movies, tv shows, management',
      totalMovies,
      totalUsers,
      totalComments,
      localComments,
      localReviews
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.admin_settings_get = async (req, res) => {
  try {
    // جلب الإعدادات من قاعدة البيانات
    const settings = await Settings.findOne();

    res.render('pages/dashboard/settings', {
      title: 'Admin Settings',
      settings,
      success: req.flash('success'),
      error: req.flash('error')
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.admin_settings_put = async (req, res) => {
  try {
    const { siteName, contact = {}, social = {}, copyrightText } = req.body;

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    let logoUrl = req.body.logoUrl || settings.logoUrl || '';

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'flixify/logo',
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      });

      logoUrl = result.secure_url;

      fs.unlinkSync(req.file.path);
    }

    settings.siteName = siteName || settings.siteName;
    settings.logoUrl = logoUrl;

    settings.contact = {
      phone: contact.phone || settings.contact?.phone || '',
      email: contact.email || settings.contact?.email || '',
    };

    settings.social = {
      facebook: social.facebook || settings.social?.facebook || '',
      instagram: social.instagram || settings.social?.instagram || '',
      twitter: social.twitter || settings.social?.twitter || '',
      vk: social.vk || settings.social?.vk || '',
    };

    settings.copyrightText = copyrightText || settings.copyrightText || '';

    await settings.save();

    req.flash('success', 'Settings updated successfully');
    res.redirect('/admin/settings');
  } catch (error) {
    console.error('Error updating settings:', error);
    req.flash('error', 'Failed to update settings');
    res.redirect('/admin/settings');
  }
};

exports.admin_add_movies_series_get = (req, res) => {
  res.render('pages/dashboard/addItems', {
    title: 'Add Movie/Series',
  });
}

exports.admin_add_movies_series_post = async (req, res) => {
  try {
    await seedMovies();  // تشغيل الدالة التي تجلب وتضيف الأفلام والمسلسلات

    req.flash('success', 'Movies and series added successfully!');
    res.redirect('/admin/add-movies-series');
  } catch (error) {
    console.error('Error seeding movies and series:', error);
    req.flash('error', 'Failed to add movies and series. Please try again later.');

    res.redirect('/admin/add-movies-series');
  }
};