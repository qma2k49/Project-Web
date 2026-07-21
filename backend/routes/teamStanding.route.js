import express from 'express';
import {
  getTeamStandingsByTournament,
  createOrUpdateTeamStanding,
  recalculateTournamentStandings,
  deleteTeamStanding,
} from '../controllers/teamStanding.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/tournament/:tournamentId', getTeamStandingsByTournament);
router.post('/recalculate/:tournamentId', requireAdmin, recalculateTournamentStandings);
router.post('/', requireAdmin, createOrUpdateTeamStanding);
router.delete('/:id', requireAdmin, deleteTeamStanding);

export default router;
