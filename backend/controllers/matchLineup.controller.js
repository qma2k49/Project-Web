import MatchLineupModel from '../models/matchLineup.model.js';

const matchLineupController = {
  getLineupByMatch: async (req, res) => {
    try {
      const { matchId } = req.params;
      const lineups = await MatchLineupModel.find({ matchId })
        .populate('teamId')
        .populate('startingXI')
        .populate('substitutes');
      res.status(200).json(lineups);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy đội hình trận đấu', error: error.message });
    }
  },

  saveOrUpdateLineup: async (req, res) => {
    try {
      const { matchId, teamId, formation, startingXI, substitutes } = req.body;

      const lineup = await MatchLineupModel.findOneAndUpdate(
        { matchId, teamId },
        {
          formation: formation || '4-3-3',
          startingXI: startingXI || [],
          substitutes: substitutes || [],
        },
        { new: true, upsert: true }
      )
        .populate('teamId')
        .populate('startingXI')
        .populate('substitutes');

      res.status(200).json({ message: 'Đã lưu đội hình thi đấu thành công', lineup });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lưu đội hình thi đấu', error: error.message });
    }
  },

  deleteLineup: async (req, res) => {
    try {
      await MatchLineupModel.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Đã xóa đội hình thi đấu' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi xóa đội hình thi đấu', error: error.message });
    }
  }
};

export default matchLineupController;
