import express from 'express';
import { getPosts, createPost, likePost, addComment, getComments } from '../controllers/community.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/posts', getPosts);
router.post('/posts', protect, createPost);
router.put('/posts/:id/like', protect, likePost);
router.post('/posts/:id/comments', protect, addComment);
router.get('/posts/:id/comments', getComments);

export default router;
