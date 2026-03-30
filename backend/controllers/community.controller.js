import Post from '../models/Post.js';

// Seed data if DB is empty
const initialPosts = [
  { author: '60d0fe4f5311236168a109ca', title: 'Managing Aphids in Tomato Plants', content: 'What are some organic ways to manage aphid infestations before they ruin the entire crop? I have tried neem oil but the results are mixed.', tags: ['Pest Control', 'Tomatoes'], likes: 24, replies: [] },
  { author: '60d0fe4f5311236168a109cb', title: 'Government Subsidy For Solar Pumps', content: 'Just an update for farmers in Maharashtra: The PM-KUSUM scheme application dates have been extended. Great opportunity to get a 60% subsidy.', tags: ['Subsidies', 'Irrigation'], likes: 112, replies: [] },
  { author: '60d0fe4f5311236168a109cc', title: 'Expected Soybean Prices next month?', content: 'Wondering if I should hold onto my stock or sell it now at the Latur APMC. Are we expecting a price surge?', tags: ['Market', 'Soybean'], likes: 15, replies: [] }
];

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'name profilePic')
      .populate('likes', 'name profilePic')
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map(p => {
      try {
        const likesArray = Array.isArray(p.likes) ? p.likes : [];
        const commentsArray = Array.isArray(p.comments) ? p.comments : [];
        
        return {
          id: p._id,
          author: p.userId ? (p.userId.name || 'Anonymous Farmer') : 'Unknown Farmer', 
          authorId: p.userId ? (p.userId._id || p.userId) : null,
          authorPic: p.userId ? p.userId.profilePic : null,
          time: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent',
          title: p.title || 'Untitled Discussion',
          content: p.content || '',
          image: p.image || null,
          likes: likesArray.length,
          likedBy: likesArray.map(u => ({ id: u._id, name: u.name, profilePic: u.profilePic })),
          hasLiked: (req.user && req.user.id) ? likesArray.some(u => u && u._id && u._id.toString() === req.user.id) : false,
          replies: commentsArray.length,
          tags: Array.isArray(p.tags) ? p.tags : []
        };
      } catch (err) {
        console.error('Error mapping individual post:', p._id, err);
        return null;
      }
    }).filter(p => p !== null);

    res.status(200).json({ success: true, data: formattedPosts });
  } catch (error) {
    console.error('CRITICAL: Error fetching community posts:', error);
    res.status(500).json({ success: false, message: 'Server error fetching posts' });
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
      image: req.file ? req.file.path : null,
      tags: tags || [],
      likes: [],
    });

    await newPost.save();
    const populated = await Post.findById(newPost._id).populate('userId', 'name profilePic');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Like a post (toggle)
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
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    
    // Repopulate likes to return to frontend
    const updatedPost = await Post.findById(id).populate('likes', 'name profilePic');

    res.status(200).json({ 
      success: true, 
      likes: updatedPost.likes.length,
      likedBy: updatedPost.likes.map(u => ({ id: u._id, name: u.name, profilePic: u.profilePic })),
      hasLiked: index === -1 
    });
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
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await post.deleteOne();
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.userId.toString() !== req.user.id && post.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    post.comments = post.comments.filter(c => c._id.toString() !== commentId);
    await post.save();

    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
