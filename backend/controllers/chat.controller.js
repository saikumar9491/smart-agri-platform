import mongoose from 'mongoose';
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
    const currentUserId = new mongoose.Types.ObjectId(req.user.id);

    const chats = await Message.aggregate([
      // 1. Match all messages involving the user
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { recipient: currentUserId }
          ]
        }
      },
      // 2. Sort by date desc to get the latest messages first
      { $sort: { createdAt: -1 } },
      // 3. Project to define the "chatPartner"
      {
        $project: {
          chatPartner: {
            $cond: {
              if: { $eq: ["$sender", currentUserId] },
              then: "$recipient",
              else: "$sender"
            }
          },
          content: 1,
          createdAt: 1
        }
      },
      // 4. Group by chatPartner to get unique conversations
      {
        $group: {
          _id: "$chatPartner",
          lastMessage: { $first: "$content" },
          timestamp: { $first: "$createdAt" }
        }
      },
      // 5. Join with Users collection to get partner details
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      // 6. Unwind userDetails (array to object)
      { $unwind: "$userDetails" },
      // 7. Project final shape
      {
        $project: {
          _id: 0,
          user: {
            _id: "$userDetails._id",
            name: "$userDetails.name",
            profilePic: "$userDetails.profilePic",
            role: "$userDetails.role"
          },
          lastMessage: 1,
          timestamp: 1
        }
      },
      // 8. Sort final list by latest activity
      { $sort: { timestamp: -1 } }
    ]);

    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error('Get Recent Chats Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
