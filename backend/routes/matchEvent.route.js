import express from 'express';
import matchEventController from '../controllers/matchEvent.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/match/:matchId', matchEventController.getEventsByMatch);
router.post('/', requireAdmin, matchEventController.createMatchEvent);
router.delete('/:id', requireAdmin, matchEventController.deleteMatchEvent);

export default router;
