import express from 'express';
import predictionController from '../controllers/prediction.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, predictionController.submitPrediction);
router.get('/my-predictions', verifyToken, predictionController.getMyPredictions);
router.get('/leaderboard', predictionController.getLeaderboard);

export default router;
