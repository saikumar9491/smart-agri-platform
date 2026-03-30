import User from '../models/User.js';
import Post from '../models/Post.js';
import OTP from '../models/OTP.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { sendEmail } from '../utils/sendEmail.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Notification from '../models/Notification.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

console.log(`[AUTH] Google Client ID loaded: ${process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 15) : 'MISSING'}...`);

// ================= HELPERS =================
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id, role) =>
  jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: '7d' }
  );

// Cloudinary is handled in the route

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
      message: 'OTP sent! (If email fails, check server logs for the code)',
    });
  } catch (error) {
    console.error('Send OTP Error:', error);

    // 🔥 PROD-DEV HYBRID: Allow proceeding even if email fails
    // This unblocks users who can see their own server logs (like the developer)
    return res.status(200).json({
      success: true,
      message: 'OTP generated! Please check server logs if the email does not arrive.',
      emailError: true
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

    const userRole = email === 'balisaikumar9491@gmail.com' ? 'admin' : 'user';

    const user = await User.create({
      name,
      email,
      password: hashed,
      location,
      farmSize,
      soilType,
      role: userRole,
    });

    return res.status(201).json({
      success: true,
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        farmSize: user.farmSize,
        soilType: user.soilType,
        role: user.role,
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

    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.',
      });
    }

    // Auto-promote hardcoded admin email if they somehow lost the role
    if (email === 'balisaikumar9491@gmail.com' && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
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
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        farmSize: user.farmSize,
        soilType: user.soilType,
        role: user.role,
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

    const isAdminEmail = email === 'balisaikumar9491@gmail.com';

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
        role: isAdminEmail ? 'admin' : 'user'
      });
    } else if (isAdminEmail && user.role !== 'admin') {
      // Auto-promote if they are the admin email but not an admin yet
      user.role = 'admin';
      await user.save();
    }

    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.',
      });
    }

    return res.status(200).json({
      success: true,
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        role: user.role,
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
      message: 'Password reset OTP sent!',
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);

    return res.status(200).json({
      success: true,
      message: 'OTP generated! Please check server logs if the email does not arrive.',
      emailError: true
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

// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
  try {
    const { name, location, bio, profilePic, farmSize, soilType } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name) user.name = name;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (profilePic !== undefined) user.profilePic = profilePic;
    if (farmSize !== undefined) user.farmSize = farmSize;
    if (soilType !== undefined) user.soilType = soilType;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        bio: user.bio,
        profilePic: user.profilePic,
        farmSize: user.farmSize,
        soilType: user.soilType,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
    });
  }
};

// ================= UPLOAD PROFILE PHOTO =================
export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Cloudinary returns the full URL in req.file.path
    const photoUrl = req.file.path;
    user.profilePic = photoUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile photo updated!',
      profilePic: photoUrl,
      user
    });
  } catch (error) {
    console.error('Profile Photo Upload Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET PUBLIC PROFILE =================
export const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const posts = await Post.find({ userId: id }).sort({ createdAt: -1 });
    
    // map the posts
    const formattedPosts = posts.map(p => {
      const likesArray = Array.isArray(p.likes) ? p.likes : [];
      const commentsArray = Array.isArray(p.comments) ? p.comments : [];
      return {
        id: p._id,
        author: user.name,
        authorId: user._id,
        authorPic: user.profilePic,
        time: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent',
        title: p.title || 'Untitled Discussion',
        content: p.content || '',
        likes: likesArray.length,
        hasLiked: req.user ? likesArray.some(lid => lid && lid.toString() === req.user.id) : false,
        replies: commentsArray.length,
        tags: Array.isArray(p.tags) ? p.tags : []
      };
    });

    const isFollowing = req.user && user.followers 
       ? user.followers.some(followerId => followerId.toString() === req.user.id) 
       : false;

    res.status(200).json({
      success: true,
      profile: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        location: user.location,
        farmSize: user.farmSize,
        soilType: user.soilType,
        profilePic: user.profilePic,
        followersCount: user.followers ? user.followers.length : 0,
        followingCount: user.following ? user.following.length : 0,
        isFollowing,
        createdAt: user.createdAt
      },
      posts: formattedPosts
    });
  } catch (error) {
    console.error('Get Public Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================= TOGGLE FOLLOW USER =================
export const toggleFollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    if (id === currentUserId) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(id);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!targetUser.followers) targetUser.followers = [];
    if (!currentUser.following) currentUser.following = [];

    const isFollowing = targetUser.followers.includes(currentUserId);

    if (isFollowing) {
      // Unfollow
      targetUser.followers = targetUser.followers.filter(followerId => followerId.toString() !== currentUserId);
      currentUser.following = currentUser.following.filter(followingId => followingId.toString() !== id);
    } else {
      // Follow
      targetUser.followers.push(currentUserId);
      currentUser.following.push(targetUser._id);

      // Create Notification alert for target user
      await Notification.create({
        title: 'New Follower',
        message: `${currentUser.name} started following you.`,
        type: 'follow',
        target: 'specific',
        recipientId: targetUser._id,
        createdBy: currentUser._id
      });
    }

    await targetUser.save();
    await currentUser.save();

    res.status(200).json({
      success: true,
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length
    });
  } catch (error) {
    console.error('Toggle Follow Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================= SEARCH USERS =================
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(200).json({ success: true, users: [] });
    }

    const users = await User.find({ name: { $regex: q, $options: 'i' } })
      .select('name profilePic role')
      .limit(5);

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Search Users Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};