import User from '../models/User.js';
import OTP from '../models/OTP.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ================= HELPER =================
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key', {
    expiresIn: '7d'
  });
};

// ================= SEND OTP =================
export const sendOtp = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email || !type) {
      return res.status(400).json({ success: false, message: 'Email and type are required' });
    }

    if (type === 'signup') {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    if (type === 'reset') {
      const exists = await User.findOne({ email });
      if (!exists) return res.status(400).json({ success: false, message: 'No account found' });
    }

    await OTP.deleteMany({ email, type });

    const otp = generateOTP();

    await OTP.create({
      email,
      otp,
      type,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    console.log(`📧 OTP for ${email} (${type}): ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      devOtp: otp // remove in production
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================= VERIFY OTP =================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, type } = req.body;

    const record = await OTP.findOne({ email, otp, type });

    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (record.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: record._id });
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    await OTP.deleteOne({ _id: record._id });

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password, location, farmSize, soilType } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, message: 'User exists' });

    const hashed = await bcrypt.hash(password, 10);

    user = await User.create({
      name,
      email,
      password: hashed,
      location,
      farmSize,
      soilType
    });

    res.json({
      success: true,
      token: generateToken(user._id),
      user
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    res.json({
      success: true,
      token: generateToken(user._id),
      user
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// ================= GOOGLE LOGIN =================
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: "google-auth",
        avatar: picture
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user
    });

  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, message: 'Google login failed' });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    await OTP.deleteMany({ email, type: 'reset' });

    const otp = generateOTP();

    await OTP.create({
      email,
      otp,
      type: 'reset',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    console.log(`🔑 Reset OTP: ${otp}`);

    res.json({ success: true, devOtp: otp });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = await OTP.findOne({ email, otp, type: 'reset' });

    if (!record) return res.status(400).json({ success: false });

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate({ email }, { password: hashed });
    await OTP.deleteOne({ _id: record._id });

    res.json({ success: true });

  } catch {
    res.status(500).json({ success: false });
  }
};

// ================= GET ME =================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ success: false });
  }
};