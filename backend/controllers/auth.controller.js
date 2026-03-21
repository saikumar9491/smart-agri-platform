import User from '../models/User.js';
import OTP from '../models/OTP.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { sendEmail } from '../utils/sendEmail.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ================= HELPERS =================
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id) =>
  jwt.sign(
    { id },
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: '7d' }
  );

// ================= SEND OTP =================
export const sendOtp = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email || !type) {
      return res.status(400).json({
        success: false,
        message: 'Email and type are required',
      });
    }

    if (!['signup', 'reset'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP type',
      });
    }

    const userExists = await User.findOne({ email });

    if (type === 'signup' && userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    if (type === 'reset' && !userExists) {
      return res.status(400).json({
        success: false,
        message: 'No account found with this email',
      });
    }

    await OTP.deleteMany({ email, type });

    const otp = generateOTP();

    await OTP.create({
      email,
      otp,
      type,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    console.log(`[AUTH] OTP for ${email} (${type}): ${otp}`);

    await sendEmail(
      email,
      type === 'signup' ? 'Your Signup OTP Code 🌱' : 'Your Password Reset OTP 🔑',
      `Your OTP is ${otp}. It expires in 5 minutes.`
    );


    return res.status(200).json({
      success: true,
      message: 'OTP sent to email successfully',
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while sending OTP',
    });
  }
};

// ================= VERIFY OTP =================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, type } = req.body;

    if (!email || !otp || !type) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and type are required',
      });
    }

    const record = await OTP.findOne({ email, otp, type });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    if (record.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: record._id });
      return res.status(400).json({
        success: false,
        message: 'OTP expired',
      });
    }

    await OTP.deleteOne({ _id: record._id });

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying OTP',
    });
  }
};

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password, location, farmSize, soilType } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      location,
      farmSize,
      soilType,
    });

    return res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        farmSize: user.farmSize,
        soilType: user.soilType,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    return res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        farmSize: user.farmSize,
        soilType: user.soilType,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// ================= GOOGLE LOGIN =================
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required',
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token',
      });
    }

    const { email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google account email not found',
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36).slice(-10),
        10
      );

      user = await User.create({
        name: name || 'Google User',
        email,
        password: randomPassword,
        avatar: picture || '',
      });
    }

    return res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
      },
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    return res.status(401).json({
      success: false,
      message: 'Google login failed',
    });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    await OTP.deleteMany({ email, type: 'reset' });

    const otp = generateOTP();

    await OTP.create({
      email,
      otp,
      type: 'reset',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    console.log(`[AUTH] Password Reset OTP for ${email}: ${otp}`);

    await sendEmail(
      email,
      'Password Reset OTP 🔑',
      `Your OTP is ${otp}. It expires in 5 minutes.`
    );


    return res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to email',
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while sending reset OTP',
    });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required',
      });
    }

    const record = await OTP.findOne({ email, otp, type: 'reset' });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    if (record.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: record._id });
      return res.status(400).json({
        success: false,
        message: 'OTP expired',
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate({ email }, { password: hashed });
    await OTP.deleteOne({ _id: record._id });

    return res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while resetting password',
    });
  }
};

// ================= GET ME =================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user',
    });
  }
};