import express from 'express';
import {
    getTournaments,
    getTournamentById,
    createTournament,
    updateTournament,
    deleteTournament
} from '../controllers/tournament.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const tournamentRouter = express.Router();

tournamentRouter.get('/', getTournaments);
tournamentRouter.get('/:id', getTournamentById);
tournamentRouter.post('/', requireAdmin, createTournament);
tournamentRouter.put('/:id', requireAdmin, updateTournament);
tournamentRouter.delete('/:id', requireAdmin, deleteTournament);

export default tournamentRouter;
