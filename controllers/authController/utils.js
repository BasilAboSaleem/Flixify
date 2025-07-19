const {check ,validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../../models/User');
var jwt = require("jsonwebtoken");

module.exports = {check ,validationResult , bcrypt, crypto, nodemailer, User, jwt};