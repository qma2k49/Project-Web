import PredictionModel from '../models/prediction.model.js';
import PredictionLeaderboardModel from '../models/predictionLeaderboard.model.js';
import MatchModel from '../models/match.model.js';

export const submitPrediction = async (req, res) => {
  try {
    const { matchId, homeScore, awayScore } = req.body;
    const userId = req.user.id;

    // Check if match status is Scheduled
    const match = await MatchModel.findById(matchId);
    if (match && match.status !== 'Scheduled') {
      return res.status(400).json({ message: 'Trận đấu đã khởi tranh hoặc kết thúc, không thể dự đoán nữa!' });
    }

    let prediction = await PredictionModel.findOne({ accountId: userId, matchId });
    if (prediction) {
      prediction.predictedHomeScore = homeScore;
      prediction.predictedAwayScore = awayScore;
      await prediction.save();
    } else {
      prediction = await PredictionModel.create({
        accountId: userId,
        matchId,
        predictedHomeScore: homeScore,
        predictedAwayScore: awayScore,
      });
    }

    res.status(200).json({ message: 'Đã lưu dự đoán tỷ số thành công', prediction });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi gửi dự đoán', error: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await PredictionLeaderboardModel.find().populate('accountId', 'userName').sort({ totalScore: -1 });
    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy bảng xếp hạng dự đoán', error: error.message });
  }
};
