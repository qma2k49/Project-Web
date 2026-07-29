import express from 'express';
import predictionController from '../controllers/prediction.controller.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, predictionController.submitPrediction);
router.get('/my-predictions', verifyToken, predictionController.getMyPredictions);
router.get('/leaderboard', predictionController.getLeaderboard);

// Admin Routes
router.get('/all-predictions', requireAdmin, predictionController.getAllPredictions);
router.put('/leaderboard/:id', requireAdmin, predictionController.updateLeaderboardScore);
router.post('/recalculate', requireAdmin, predictionController.recalculatePoints);

export default router;
