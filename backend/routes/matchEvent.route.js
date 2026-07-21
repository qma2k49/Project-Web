import express from 'express';
import {
  getEventsByMatch,
  createMatchEvent,
  deleteMatchEvent,
} from '../controllers/matchEvent.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/match/:matchId', getEventsByMatch);
router.post('/', requireAdmin, createMatchEvent);
router.delete('/:id', requireAdmin, deleteMatchEvent);

export default router;
