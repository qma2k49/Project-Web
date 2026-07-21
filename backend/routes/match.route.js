import express from 'express';
import { getMatches, getMatchById, createMatch, saveLineup, triggerMatchEvent, deleteMatch } from '../controllers/match.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getMatches);
router.get('/:id', getMatchById);
router.post('/', requireAdmin, createMatch);
router.post('/:matchId/lineup', requireAdmin, saveLineup);
router.post('/:matchId/events', requireAdmin, triggerMatchEvent);
router.delete('/:id', requireAdmin, deleteMatch);

export default router;
