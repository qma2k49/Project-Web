import express from 'express';
import {
  register,
  login,
  getMe,
  getAllAccounts,
  updateAccountRole,
  deleteAccount,
} from '../controllers/auth.controller.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.get('/accounts', requireAdmin, getAllAccounts);
router.put('/accounts/:id/role', requireAdmin, updateAccountRole);
router.delete('/accounts/:id', requireAdmin, deleteAccount);

export default router;
