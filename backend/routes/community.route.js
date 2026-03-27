import express from 'express';
import { getPosts, createPost, likePost, addComment, getComments, deletePost, deleteComment } from '../controllers/community.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.delete('/posts/:id', protect, deletePost);
router.delete('/posts/:id/comments/:commentId', protect, deleteComment);
router.get('/posts', protect, getPosts);
router.post('/posts', protect, createPost);
router.put('/posts/:id/like', protect, likePost);
router.post('/posts/:id/comments', protect, addComment);
router.get('/posts/:id/comments', protect, getComments);

export default router;
