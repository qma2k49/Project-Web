import express from 'express';
import personController from '../controllers/person.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', personController.getPersons);
router.post('/', requireAdmin, personController.createPerson);
router.put('/:id', requireAdmin, personController.updatePerson);
router.delete('/:id', requireAdmin, personController.deletePerson);

export default router;
