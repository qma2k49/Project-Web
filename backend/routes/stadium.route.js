import express from 'express';
import stadiumController from '../controllers/stadium.controller.js';

const stadiumRouter = express.Router();

// Khai báo các endpoint
stadiumRouter.post('/', stadiumController.createStadium);
stadiumRouter.get('/', stadiumController.getAllStadiums);
stadiumRouter.get('/:id', stadiumController.getStadiumById);
stadiumRouter.put('/:id', stadiumController.updateStadium);
stadiumRouter.delete('/:id', stadiumController.deleteStadium);

export default stadiumRouter;
