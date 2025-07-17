require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); 

// بيانات حساب الأدمن
const adminData = {
  name: 'Admin',
  email: process.env.EMAIL,
  password: process.env.PASSWORD,
  role: 'admin',
  isVerified: true,
};

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    // تحقق إذا الأدمن موجود مسبقًا
    const existingAdmin = await User.findOne({ email: adminData.email , role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists.');
      process.exit();
    }

    // تشفير كلمة السر
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    adminData.password = hashedPassword;

    // إنشاء الأدمن
    const admin = new User(adminData);
    await admin.save();

    console.log('Admin user created successfully.');
    process.exit();
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();
