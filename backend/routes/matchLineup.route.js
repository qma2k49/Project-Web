import express from 'express';
import matchLineupController from '../controllers/matchLineup.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/match/:matchId', matchLineupController.getLineupByMatch);
router.post('/', requireAdmin, matchLineupController.saveOrUpdateLineup);
router.delete('/:id', requireAdmin, matchLineupController.deleteLineup);

export default router;
