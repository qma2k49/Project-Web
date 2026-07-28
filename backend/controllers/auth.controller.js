import AccountModel from '../models/account.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'qlbongda_secret_key_2026';

const authController = {
  register: async (req, res) => {
    try {
      const { userName, email, password, role } = req.body;
      const accountName = userName || email;

      if (!accountName || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập tên tài khoản/email và mật khẩu' });
      }

      const existingUser = await AccountModel.findOne({ userName: accountName });
      if (existingUser) {
        return res.status(400).json({ message: 'Tài khoản đã tồn tại trên hệ thống' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const assignedRole = role === 'ADMIN' || accountName.includes('admin') ? 'ADMIN' : 'USER';

      const newAccount = await AccountModel.create({
        userName: accountName,
        password: hashedPassword,
        role: assignedRole,
      });

      const token = jwt.sign(
        { id: newAccount._id, userName: newAccount.userName, role: newAccount.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Đăng ký tài khoản thành công',
        token,
        user: {
          id: newAccount._id,
          userName: newAccount.userName,
          name: newAccount.userName.split('@')[0],
          email: newAccount.userName,
          role: newAccount.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server khi đăng ký', error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { userName, email, password } = req.body;
      const accountName = userName || email;

      if (!accountName || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập tên tài khoản/email và mật khẩu' });
      }

      const user = await AccountModel.findOne({ userName: accountName });
      if (!user) {
        return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
      }

      let isMatch = false;
      if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'))) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = (password === user.password);
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
      }

      const token = jwt.sign(
        { id: user._id, userName: user.userName, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        message: 'Đăng nhập thành công',
        token,
        user: {
          id: user._id,
          userName: user.userName,
          name: user.userName.split('@')[0],
          email: user.userName,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server khi đăng nhập', error: error.message });
    }
  },

  getMe: async (req, res) => {
    try {
      const user = await AccountModel.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
      }
      res.status(200).json({
        user: {
          id: user._id,
          userName: user.userName,
          name: user.userName.split('@')[0],
          email: user.userName,
          role: user.role,
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server khi lấy thông tin tài khoản', error: error.message });
    }
  },

  getAllAccounts: async (req, res) => {
    try {
      const accounts = await AccountModel.find().select('-password');
      res.status(200).json(accounts);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy danh sách tài khoản', error: error.message });
    }
  },

  updateAccountRole: async (req, res) => {
    try {
      const { role } = req.body;
      const account = await AccountModel.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select('-password');

      if (!account) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
      res.status(200).json({ message: 'Cập nhật quyền tài khoản thành công', account });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi cập nhật quyền tài khoản', error: error.message });
    }
  },

  deleteAccount: async (req, res) => {
    try {
      await AccountModel.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Đã xóa tài khoản thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi xóa tài khoản', error: error.message });
    }
  }
};

export default authController;
