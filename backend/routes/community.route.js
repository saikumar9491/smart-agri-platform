import express from 'express';
import { getPosts, createPost } from '../controllers/community.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/posts', getPosts);
router.post('/posts', protect, createPost);

export default router;
