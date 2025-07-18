const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  siteName: { type: String, required: true },
  logoUrl: { type: String, required: true },

  resourcesLinks: [{
    label: String,
    url: String,
  }],



  contact: {
    phone: String,
    email: String,
  },

  social: {
    facebook: String,
    instagram: String,
    twitter: String,
    vk: String,
  },

  copyrightText: { type: String },

}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
