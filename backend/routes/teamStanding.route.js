import express from 'express';
import teamStandingController from '../controllers/teamStanding.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/tournament/:tournamentId', teamStandingController.getTeamStandingsByTournament);
router.post('/recalculate/:tournamentId', requireAdmin, teamStandingController.recalculateTournamentStandings);
router.post('/', requireAdmin, teamStandingController.createOrUpdateTeamStanding);
router.delete('/:id', requireAdmin, teamStandingController.deleteTeamStanding);

export default router;
