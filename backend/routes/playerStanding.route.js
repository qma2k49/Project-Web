import express from 'express';
import {
  getTopScorers,
  getTopAssists,
  getCardStatistics,
  createOrUpdatePlayerStanding,
  deletePlayerStanding,
} from '../controllers/playerStanding.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/scorers/:tournamentId', getTopScorers);
router.get('/assists/:tournamentId', getTopAssists);
router.get('/cards/:tournamentId', getCardStatistics);
router.post('/', requireAdmin, createOrUpdatePlayerStanding);
router.delete('/:id', requireAdmin, deletePlayerStanding);

export default router;
