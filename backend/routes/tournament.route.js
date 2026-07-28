import express from 'express';
import tournamentController from '../controllers/tournament.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const tournamentRouter = express.Router();

tournamentRouter.get('/', tournamentController.getTournaments);
tournamentRouter.get('/:id', tournamentController.getTournamentById);
tournamentRouter.post('/', requireAdmin, tournamentController.createTournament);
tournamentRouter.put('/:id', requireAdmin, tournamentController.updateTournament);
tournamentRouter.delete('/:id', requireAdmin, tournamentController.deleteTournament);

export default tournamentRouter;
