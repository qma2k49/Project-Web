import express from 'express';
import { getPersons, createPerson, updatePerson, deletePerson } from '../controllers/person.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getPersons);
router.post('/', requireAdmin, createPerson);
router.put('/:id', requireAdmin, updatePerson);
router.delete('/:id', requireAdmin, deletePerson);

export default router;
