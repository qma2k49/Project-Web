import express from 'express';
import authController from '../controllers/auth.controller.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getMe);
router.get('/accounts', requireAdmin, authController.getAllAccounts);
router.put('/accounts/:id/role', requireAdmin, authController.updateAccountRole);
router.delete('/accounts/:id', requireAdmin, authController.deleteAccount);

export default router;
