import express from 'express';
import { getPosts, createPost, likePost, addComment, getComments, deletePost, deleteComment, updatePost } from '../controllers/community.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import multer from 'multer';
import { storage, communityStorage } from '../utils/cloudinary.js';

const upload = multer({ storage: communityStorage });

const router = express.Router();

router.delete('/posts/:id', protect, deletePost);
router.delete('/posts/:id/comments/:commentId', protect, deleteComment);
router.get('/posts', protect, getPosts);
router.post('/posts', protect, upload.single('image'), createPost);
router.put('/posts/:id', protect, upload.single('image'), updatePost);
router.put('/posts/:id/like', protect, likePost);
router.post('/posts/:id/comments', protect, addComment);
router.get('/posts/:id/comments', protect, getComments);

export default router;
