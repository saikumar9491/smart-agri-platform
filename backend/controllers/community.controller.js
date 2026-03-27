import Post from '../models/Post.js';

// Seed data if DB is empty
const initialPosts = [
  { author: '60d0fe4f5311236168a109ca', title: 'Managing Aphids in Tomato Plants', content: 'What are some organic ways to manage aphid infestations before they ruin the entire crop? I have tried neem oil but the results are mixed.', tags: ['Pest Control', 'Tomatoes'], likes: 24, replies: [] },
  { author: '60d0fe4f5311236168a109cb', title: 'Government Subsidy For Solar Pumps', content: 'Just an update for farmers in Maharashtra: The PM-KUSUM scheme application dates have been extended. Great opportunity to get a 60% subsidy.', tags: ['Subsidies', 'Irrigation'], likes: 112, replies: [] },
  { author: '60d0fe4f5311236168a109cc', title: 'Expected Soybean Prices next month?', content: 'Wondering if I should hold onto my stock or sell it now at the Latur APMC. Are we expecting a price surge?', tags: ['Market', 'Soybean'], likes: 15, replies: [] }
];

export const getPosts = async (req, res) => {
  try {
    let posts = await Post.find()
      .populate('userId', 'name profilePic')
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map(p => ({
      id: p._id,
      author: p.userId ? p.userId.name : 'Unknown Farmer', 
      authorId: p.userId ? p.userId._id : null,
      authorPic: p.userId ? p.userId.profilePic : null,
      time: new Date(p.createdAt).toLocaleDateString(),
      title: p.title,
      content: p.content,
      likes: (p.likes || []).length,
      hasLiked: req.user ? (p.likes || []).some(id => id.toString() === req.user.id) : false,
      replies: p.comments ? p.comments.length : 0,
      tags: p.tags || []
    }));

    res.status(200).json({ success: true, data: formattedPosts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const newPost = new Post({
      userId: req.user.id,
      title,
      content,
      tags: tags || [],
      likes: 0,
    });

    await newPost.save();

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Like a post (increment likes)
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (!Array.isArray(post.likes)) {
      post.likes = [];
    }

    const userId = req.user.id;
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      // Like
      post.likes.push(userId);
    } else {
      // Unlike
      post.likes.splice(index, 1);
    }

    await post.save();

    res.status(200).json({ 
      success: true, 
      likes: post.likes.length,
      hasLiked: index === -1 
    });
 drum
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add comment to a post
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.comments.push({
      userId: req.user.id,
      text,
      createdAt: new Date()
    });

    await post.save();

    // Populate and return the added comment
    const updated = await Post.findById(id).populate('comments.userId', 'name profilePic');
    const lastComment = updated.comments[updated.comments.length - 1];

    res.status(201).json({
      success: true,
      comment: {
        id: lastComment._id,
        author: lastComment.userId ? lastComment.userId.name : 'You',
        authorId: lastComment.userId ? lastComment.userId._id : req.user.id,
        authorPic: lastComment.userId ? lastComment.userId.profilePic : null,
        text: lastComment.text,
        time: new Date(lastComment.createdAt).toLocaleDateString()
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get comments for a post
export const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).populate('comments.userId', 'name profilePic');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comments = (post.comments || []).map(c => ({
      id: c._id,
      author: c.userId ? c.userId.name : 'Unknown',
      authorId: c.userId ? (c.userId._id || c.userId) : null,
      authorPic: c.userId ? c.userId.profilePic : null,
      text: c.text,
      time: new Date(c.createdAt).toLocaleDateString()
    }));

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[COMMUNITY] Deletion request for post ${id} by user ${req.user.id}`);
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if user is author or admin
    if (post.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Check if user is comment author, post author, or admin
    if (comment.userId.toString() !== req.user.id && post.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    post.comments = post.comments.filter(c => c._id.toString() !== commentId);
    await post.save();

    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
