import express from 'express';
import { submitPrediction, getLeaderboard } from '../controllers/prediction.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, submitPrediction);
router.get('/leaderboard', getLeaderboard);

export default router;
