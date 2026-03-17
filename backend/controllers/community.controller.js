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
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    // Format for frontend
    const formattedPosts = posts.map(p => ({
      id: p._id,
      author: p.userId ? p.userId.name : 'Unknown Farmer', 
      time: new Date(p.createdAt).toLocaleDateString(),
      title: p.title,
      content: p.content,
      likes: p.likes || 0,
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
