import express from 'express';
import roundNameTournementController from '../controllers/roundNameTournement.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const roundNameTournementRouter = express.Router();

roundNameTournementRouter.get('/', roundNameTournementController.getRoundNames);
roundNameTournementRouter.get('/:id', roundNameTournementController.getRoundNameById);
roundNameTournementRouter.post('/', requireAdmin, roundNameTournementController.createRoundName);
roundNameTournementRouter.put('/:id', requireAdmin, roundNameTournementController.updateRoundName);
roundNameTournementRouter.delete('/:id', requireAdmin, roundNameTournementController.deleteRoundName);

export default roundNameTournementRouter;
