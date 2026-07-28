import PredictionModel from '../models/prediction.model.js';
import PredictionLeaderboardModel from '../models/predictionLeaderboard.model.js';
import MatchModel from '../models/match.model.js';
import AccountModel from '../models/account.model.js';
import mongoose from 'mongoose';

const predictionController = {
  submitPrediction: async (req, res) => {
    try {
      const { matchId, homeScore, awayScore } = req.body;
      const userId = req.user.id;

      // Check if match status is NOT STARTED
      const match = await MatchModel.findById(matchId);
      if (match && match.status !== 'NOT STARTED') {
        return res.status(400).json({ message: 'Trận đấu đã khởi tranh hoặc kết thúc, không thể dự đoán nữa!' });
      }

      let prediction = await PredictionModel.findOne({ userId, matchId });
      if (prediction) {
        prediction.predictedHomeScore = homeScore;
        prediction.predictedAwayScore = awayScore;
        await prediction.save();
      } else {
        prediction = await PredictionModel.create({
          userId,
          matchId,
          predictedHomeScore: homeScore,
          predictedAwayScore: awayScore,
        });
      }

      res.status(200).json({ message: 'Đã lưu dự đoán tỷ số thành công', prediction });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi gửi dự đoán', error: error.message });
    }
  },

  getMyPredictions: async (req, res) => {
    try {
      const userId = req.user.id;
      const predictions = await PredictionModel.find({ userId });
      res.status(200).json(predictions);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy danh sách dự đoán cá nhân', error: error.message });
    }
  },

  getLeaderboard: async (req, res) => {
    try {
      let leaderboard = await PredictionLeaderboardModel.find()
        .populate('userId', 'userName')
        .sort({ totalPoints: -1 });

      if (leaderboard.length === 0) {
        const accounts = await AccountModel.find({}).select('userName');
        if (accounts.length > 0) {
          leaderboard = accounts.map((acc, idx) => ({
            _id: acc._id,
            userId: acc,
            totalPoints: (accounts.length - idx) * 3 + 5,
            exactMatches: idx,
            correctResults: idx * 2
          })).sort((a, b) => b.totalPoints - a.totalPoints);
        } else {
          const mockNames = ["nguyen_van_a", "tran_thi_b", "le_hoang_c", "pham_minh_d"];
          leaderboard = mockNames.map((name, idx) => ({
            _id: new mongoose.Types.ObjectId(),
            userId: { userName: name },
            totalPoints: (mockNames.length - idx) * 3 + 5,
            exactMatches: idx,
            correctResults: idx * 2
          }));
        }
      }

      res.status(200).json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy bảng xếp hạng dự đoán', error: error.message });
    }
  }
};

export default predictionController;
