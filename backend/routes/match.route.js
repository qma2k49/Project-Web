import express from 'express';
import matchController from '../controllers/match.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', matchController.getMatches);
router.get('/:id', matchController.getMatchById);
router.post('/', requireAdmin, matchController.createMatch);
router.post('/:matchId/lineup', requireAdmin, matchController.saveLineup);
router.post('/:matchId/events', requireAdmin, matchController.triggerMatchEvent);
router.delete('/:id', requireAdmin, matchController.deleteMatch);

export default router;
