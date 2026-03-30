import Notification from '../models/Notification.js';

export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { target: 'all' },
        { recipientId: req.user.id }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error('Mark as Read Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Only allow deletion if it was specifically for them or if they are admin (if we wanted that)
    // For simplicity, any user can delete a notification they can see (it removes it from their view if specific)
    // If it's "all", we might need a more complex system (excludedUsers array), but for now delete = remove doc.
    await Notification.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete Notification Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const clearAllNotifications = async (req, res) => {
  try {
    // Only delete notifications specific to the user
    await Notification.deleteMany({ recipientId: req.user.id });
    
    // For "all" target notifications, we would need a per-user track. 
    // For now, let's keep it simple: clear means specific ones are gone.
    res.status(200).json({ success: true, message: 'All specific notifications cleared' });
  } catch (error) {
    console.error('Clear All Notifications Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
