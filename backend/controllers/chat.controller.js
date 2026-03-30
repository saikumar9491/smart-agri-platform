import Message from '../models/Message.js';
import User from '../models/User.js';

export const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;

    if (!recipientId || !content) {
      return res.status(400).json({ success: false, message: 'Recipient and content are required' });
    }

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Get Conversation Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRecentChats = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Find all users the current user has interacted with
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { recipient: currentUserId }]
    }).sort({ createdAt: -1 });

    const userIds = new Set();
    messages.forEach(msg => {
      if (msg.sender.toString() !== currentUserId) userIds.add(msg.sender.toString());
      if (msg.recipient.toString() !== currentUserId) userIds.add(msg.recipient.toString());
    });

    const users = await User.find({ _id: { $in: Array.from(userIds) } })
      .select('name profilePic role');

    // Get the last message for each user to sort/show preview
    const chats = users.map(user => {
      const lastMsg = messages.find(m => 
        m.sender.toString() === user._id.toString() || 
        m.recipient.toString() === user._id.toString()
      );
      return {
        user,
        lastMessage: lastMsg.content,
        timestamp: lastMsg.createdAt
      };
    });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error('Get Recent Chats Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
