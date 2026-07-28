import PlayerStandingModel from '../models/playerStanding.model.js';

const playerStandingController = {
  getTopScorers: async (req, res) => {
    try {
      const { tournamentId } = req.params;
      const scorers = await PlayerStandingModel.find({ tournamentId })
        .populate('playerId')
        .populate('teamId')
        .sort({ goals: -1, matchesPlayed: 1 });
      res.status(200).json(scorers);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy danh sách Vua phá lưới', error: error.message });
    }
  },

  getTopAssists: async (req, res) => {
    try {
      const { tournamentId } = req.params;
      const assists = await PlayerStandingModel.find({ tournamentId })
        .populate('playerId')
        .populate('teamId')
        .sort({ assists: -1, matchesPlayed: 1 });
      res.status(200).json(assists);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy danh sách kiến tạo', error: error.message });
    }
  },

  getCardStatistics: async (req, res) => {
    try {
      const { tournamentId } = req.params;
      const cards = await PlayerStandingModel.find({ tournamentId })
        .populate('playerId')
        .populate('teamId')
        .sort({ redCards: -1, yellowCards: -1 });
      res.status(200).json(cards);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy thống kê thẻ phạt', error: error.message });
    }
  },

  createOrUpdatePlayerStanding: async (req, res) => {
    try {
      const { tournamentId, playerId, teamId, goals, assists, yellowCards, redCards, matchesPlayed, minutesPlayed } = req.body;

      const standing = await PlayerStandingModel.findOneAndUpdate(
        { tournamentId, playerId },
        {
          teamId,
          goals,
          assists,
          yellowCards,
          redCards,
          matchesPlayed,
          minutesPlayed,
        },
        { new: true, upsert: true }
      ).populate('playerId').populate('teamId');

      res.status(200).json({ message: 'Cập nhật chỉ số cầu thủ thành công', standing });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi cập nhật chỉ số cầu thủ', error: error.message });
    }
  },

  deletePlayerStanding: async (req, res) => {
    try {
      await PlayerStandingModel.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Đã xóa chỉ số cầu thủ' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi xóa chỉ số cầu thủ', error: error.message });
    }
  }
};

export default playerStandingController;
