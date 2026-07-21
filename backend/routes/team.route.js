import express from 'express';
import teamController from '../controllers/team.controller.js';

const teamRouter = express.Router();

// Standard RESTful & Legacy subpath endpoints
teamRouter.get('/', teamController.getAllTeams);
teamRouter.get('/getAll', teamController.getAllTeams);

teamRouter.post('/', teamController.createTeam);
teamRouter.post('/create', teamController.createTeam);

teamRouter.get('/:id', teamController.getTeamById);

teamRouter.put('/:id', teamController.updateTeam);
teamRouter.put('/update/:id', teamController.updateTeam);

teamRouter.delete('/:id', teamController.deleteTeam);
teamRouter.delete('/delete/:id', teamController.deleteTeam);

export default teamRouter;