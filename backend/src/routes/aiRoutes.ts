import express from 'express';
import { getAIHelpResponse } from '../controllers/aiController';

const router = express.Router();

router.post('/chat', getAIHelpResponse);

export default router;
