import express from 'express';
import playerStandingController from '../controllers/playerStanding.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/scorers/:tournamentId', playerStandingController.getTopScorers);
router.get('/assists/:tournamentId', playerStandingController.getTopAssists);
router.get('/cards/:tournamentId', playerStandingController.getCardStatistics);
router.post('/', requireAdmin, playerStandingController.createOrUpdatePlayerStanding);
router.delete('/:id', requireAdmin, playerStandingController.deletePlayerStanding);

export default router;
