import express from 'express';
import {
  getLineupByMatch,
  saveOrUpdateLineup,
  deleteLineup,
} from '../controllers/matchLineup.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/match/:matchId', getLineupByMatch);
router.post('/', requireAdmin, saveOrUpdateLineup);
router.delete('/:id', requireAdmin, deleteLineup);

export default router;
