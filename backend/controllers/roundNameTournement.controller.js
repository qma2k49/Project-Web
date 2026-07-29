import RoundNameTournementModel from '../models/roundNameTournement.model.js';

const roundNameTournementController = {
  getRoundNames: async (req, res) => {
    try {
      const { tournamentId } = req.query;
      const filter = {};
      if (tournamentId) {
        filter.tournamentId = tournamentId;
      }
      const roundNames = await RoundNameTournementModel.find(filter)
        .populate('tournamentId', 'name')
        .sort({ createdAt: 1 });
      res.status(200).json(roundNames);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy danh sách tên vòng đấu', error: error.message });
    }
  },

  getRoundNameById: async (req, res) => {
    try {
      const roundName = await RoundNameTournementModel.findById(req.params.id)
        .populate('tournamentId', 'name');
      if (!roundName) {
        return res.status(404).json({ message: 'Không tìm thấy tên vòng đấu' });
      }
      res.status(200).json(roundName);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy thông tin tên vòng đấu', error: error.message });
    }
  },

  createRoundName: async (req, res) => {
    try {
      const { tournamentId, roundName } = req.body;
      if (!tournamentId || !roundName) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ tournamentId và roundName' });
      }
      const created = await RoundNameTournementModel.create({ tournamentId, roundName });
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi tạo tên vòng đấu mới', error: error.message });
    }
  },

  updateRoundName: async (req, res) => {
    try {
      const { tournamentId, roundName } = req.body;
      const updated = await RoundNameTournementModel.findByIdAndUpdate(
        req.params.id,
        { tournamentId, roundName },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ message: 'Không tìm thấy tên vòng đấu để cập nhật' });
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi cập nhật tên vòng đấu', error: error.message });
    }
  },

  deleteRoundName: async (req, res) => {
    try {
      const deleted = await RoundNameTournementModel.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Không tìm thấy tên vòng đấu để xóa' });
      }
      res.status(200).json({ message: 'Đã xóa tên vòng đấu thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi xóa tên vòng đấu', error: error.message });
    }
  }
};

export default roundNameTournementController;
