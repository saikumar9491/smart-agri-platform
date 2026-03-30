import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Crop from '../models/Crop.js';
import Post from '../models/Post.js';
import MarketPrice from '../models/MarketPrice.js';
import AIResult from '../models/AIResult.js';
import GlobalSetting from '../models/GlobalSetting.js';
import AuditLog from '../models/AuditLog.js';
import { sendEmail } from '../utils/sendEmail.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {

    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();
    
    await logAdminAction(req, 'UPDATE_USER_ROLE', id, `Updated role to ${role}`);

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
    }

    await user.deleteOne();
    await logAdminAction(req, 'DELETE_USER', id, `Permanently deleted user ${user.email}`);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create notification
// @route   POST /api/admin/notifications
// @access  Private/Admin
export const createNotification = async (req, res) => {
  try {
    const { title, message, type, target, recipientId, alsoSendEmail } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const notification = await Notification.create({
      title,
      message,
      type: type || 'info',
      target: target || 'all',
      recipientId: target === 'specific' ? recipientId : null,
      createdBy: req.user.id,
    });

    // Handle Email Notification
    if (alsoSendEmail) {
      const recipient = target === 'specific' ? await User.findById(recipientId) : null;
      const emailList = recipient ? [recipient.email] : (await User.find({ role: 'user' }).select('email')).map(u => u.email);
      
      for (const email of emailList) {
        await sendEmail({
          email,
          subject: title,
          message: `${message}\n\nSent via Smart Agri Admin Dashboard`
        });
      }
    }

    await logAdminAction(req, 'CREATE_NOTIFICATION', notification._id, `Sent ${target} notification: ${title}`);

    res.status(201).json({
      success: true,
      message: alsoSendEmail ? 'Notification created and emails sent' : 'Notification created successfully',
      notification,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const cropCount = await Crop.countDocuments();
    const postCount = await Post.countDocuments();
    const notificationCount = await Notification.countDocuments();

    // Get recent users
    const recentUsers = await User.find({}).select('name email createdAt').sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      stats: {
        users: userCount,
        crops: cropCount,
        posts: postCount,
        notifications: notificationCount,
      },
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get notifications for users
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { target: 'all' },
        { recipientId: req.user.id }
      ]
    })
      .populate('createdBy', 'name profilePic')
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user status (Active/Blocked)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent blocking self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot block yourself' });
    }

    user.status = user.status === 'active' ? 'blocked' : 'active';
    await user.save();
    
    await logAdminAction(req, 'TOGGLE_USER_STATUS', id, `User status set to ${user.status}`);

    res.status(200).json({
      success: true,
      message: `User status updated to ${user.status}`,
      user: {
        _id: user._id,
        name: user.name,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/admin/notifications/:id
// @access  Private/Admin
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    await logAdminAction(req, 'DELETE_NOTIFICATION', req.params.id, `Deleted notification: ${notification.title}`);
    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new crop
// @route   POST /api/admin/crops
// @access  Private/Admin
export const addCrop = async (req, res) => {
  try {
    const { name, idealSoil, season, waterRequirement, estimatedYield, description } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ success: false, message: 'Name and description are required' });
    }

    const crop = await Crop.create({
      name,
      idealSoil,
      season,
      waterRequirement,
      estimatedYield,
      description
    });
    await logAdminAction(req, 'ADD_CROP', crop._id, `Added new crop: ${crop.name}`);

    res.status(201).json({
      success: true,
      message: 'Crop added successfully',
      crop
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create official admin post
// @route   POST /api/admin/posts
// @access  Private/Admin
export const createAdminPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const post = await Post.create({
      userId: req.user.id,
      title: `[OFFICIAL] ${title}`,
      content,
      tags: tags || ['Announcement']
    });
    await logAdminAction(req, 'CREATE_ADMIN_POST', post._id, `Created admin post: ${post.title}`);

    res.status(201).json({
      success: true,
      message: 'Admin post created successfully',
      post
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all notifications (for admin management)
// @route   GET /api/admin/notifications
// @access  Private/Admin
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all community posts (for moderation)
// @route   GET /api/admin/posts
// @access  Private/Admin
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete any community post
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    await Post.findByIdAndDelete(id);
    
    await logAdminAction(req, 'DELETE_POST', id, `Deleted community post: ${post.title}`);

    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a comment from a post
// @route   DELETE /api/admin/posts/:postId/comments/:commentId
// @access  Private/Admin
export const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    const initialCommentCount = post.comments.length;
    post.comments = post.comments.filter(c => c._id.toString() !== req.params.commentId);
    
    if (post.comments.length === initialCommentCount) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    await post.save();
    await logAdminAction(req, 'DELETE_COMMENT', req.params.commentId, `Deleted comment from post ${req.params.postId}`);
    
    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add market price
// @route   POST /api/admin/market
// @access  Private/Admin
export const addMarketPrice = async (req, res) => {
  try {
    const { cropName, marketLocation, pricePerKg, trend } = req.body;
    if (!cropName || !marketLocation || !pricePerKg) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const price = await MarketPrice.create({
      cropName,
      marketLocation,
      pricePerKg,
      trend: trend || 'stable'
    });
    await logAdminAction(req, 'ADD_MARKET_PRICE', price._id, `Added market price for ${cropName} at ${marketLocation}`);

    res.status(201).json({ success: true, message: 'Market price added', price });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all market prices (for management)
// @route   GET /api/admin/market
// @access  Private/Admin
export const getAllMarketPrices = async (req, res) => {
  try {
    const prices = await MarketPrice.find({}).sort({ date: -1 });
    res.status(200).json({ success: true, prices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete market price entry
// @route   DELETE /api/admin/market/:id
// @access  Private/Admin
export const deleteMarketPrice = async (req, res) => {
  try {
    await MarketPrice.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Market price deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get AI Disease Insights
// @route   GET /api/admin/insights
// @access  Private/Admin
export const getInsights = async (req, res) => {
  try {
    const totalScans = await AIResult.countDocuments();
    
    // Most common diseases
    const diseaseStats = await AIResult.aggregate([
      { $group: { _id: '$detectedDisease', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Confidence average
    const avgConfidence = await AIResult.aggregate([
      { $group: { _id: null, avg: { $avg: '$confidenceScore' } } }
    ]);

    // Recent scans
    const recentScans = await AIResult.find({})
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      insights: {
        totalScans,
        diseaseStats,
        avgConfidence: avgConfidence[0]?.avg || 0,
        recentScans
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Global Settings
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getGlobalSettings = async (req, res) => {
  try {
    const settings = await GlobalSetting.find({});
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Global Setting
// @route   POST /api/admin/settings
// @access  Private/Admin
export const updateGlobalSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    let setting = await GlobalSetting.findOne({ key });
    
    if (setting) {
      setting.value = value;
      setting.updatedBy = req.user.id;
      setting.updatedAt = Date.now();
      await setting.save();
    } else {
      setting = await GlobalSetting.create({
        key,
        value,
        updatedBy: req.user.id
      });
    }

    res.status(200).json({ success: true, message: 'Setting updated', setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload Kishan TV Video
// @route   POST /api/admin/settings/video
// @access  Private/Admin
export const uploadKishanTVVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const videoPath = `/uploads/${req.file.filename}`;
    
    let setting = await GlobalSetting.findOne({ key: 'agriCamUrl' });
    if (setting) {
      setting.value = videoPath;
      setting.updatedBy = req.user.id;
      setting.updatedAt = Date.now();
      await setting.save();
    } else {
      await GlobalSetting.create({ 
        key: 'agriCamUrl', 
        value: videoPath,
        updatedBy: req.user.id
      });
    }

    await logAdminAction(
      req.user.id,
      'UPDATE_SETTING',
      'GlobalSetting',
      null,
      { key: 'agriCamUrl', value: videoPath }
    );

    res.status(200).json({ success: true, url: videoPath });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk Update Users
// @route   PUT /api/admin/users/bulk
// @access  Private/Admin
export const bulkUpdateUsers = async (req, res) => {
  try {
    const { userIds, action } = req.body; // action: 'block', 'unblock', 'delete', 'makeAdmin', 'makeUser'
    
    if (!userIds || !Array.isArray(userIds) || !action) {
      return res.status(400).json({ success: false, message: 'Invalid bulk action data' });
    }

    // Filter out self to prevent suicide
    const targetIds = userIds.filter(id => id !== req.user.id);

    let result;
    switch (action) {
      case 'block':
        result = await User.updateMany({ _id: { $in: targetIds } }, { status: 'blocked' });
        break;
      case 'unblock':
        result = await User.updateMany({ _id: { $in: targetIds } }, { status: 'active' });
        break;
      case 'delete':
        result = await User.deleteMany({ _id: { $in: targetIds } });
        break;
      case 'makeAdmin':
        result = await User.updateMany({ _id: { $in: targetIds } }, { role: 'admin' });
        break;
      case 'makeUser':
        result = await User.updateMany({ _id: { $in: targetIds } }, { role: 'user' });
        break;
      default:
        return res.status(400).json({ success: false, message: 'Unknown action' });
    }

    res.status(200).json({ success: true, message: `Bulk action '${action}' completed`, affectedCount: result.modifiedCount || result.deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Audit Logs
// @route   GET /api/admin/logs
// @access  Private/Admin
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({})
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export Market Data as CSV
// @route   GET /api/admin/export/market
// @access  Private/Admin
export const exportMarketData = async (req, res) => {
  try {
    const prices = await MarketPrice.find({}).sort({ cropName: 1 });
    const csvHeader = 'CropName,Location,PricePerKg,Trend,LastUpdated\n';
    const csvRows = prices.map(p => 
      `"${p.cropName}","${p.marketLocation}","${p.pricePerKg}","${p.trend}","${p.updatedAt.toISOString()}"`
    ).join('\n');
    
    await logAdminAction(req, 'EXPORT_MARKET', null, 'Exported market price data to CSV');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=market_prices.csv');
    res.status(200).send(csvHeader + csvRows);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export User Data as CSV
// @route   GET /api/admin/export/users
// @access  Private/Admin
export const exportUsersData = async (req, res) => {
  try {
    const users = await User.find({}).select('name email role status createdAt').sort({ createdAt: -1 });
    const csvHeader = 'Name,Email,Role,Status,CreatedAt\n';
    const csvRows = users.map(u => 
      `"${u.name}","${u.email}","${u.role}","${u.status}","${u.createdAt.toISOString()}"`
    ).join('\n');
    
    await logAdminAction(req, 'EXPORT_USERS', null, 'Exported user data to CSV');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users_data.csv');
    res.status(200).send(csvHeader + csvRows);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to log admin actions
const logAdminAction = async (req, action, targetId, details) => {
  try {
    await AuditLog.create({
      adminId: req.user.id,
      action,
      targetId,
      details,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    });
  } catch (error) {
    console.error('Audit Log Error:', error.message);
  }
};
