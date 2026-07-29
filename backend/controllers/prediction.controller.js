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

      // Check if match status is NOT STARTED and kickoff time is in the future
      const match = await MatchModel.findById(matchId);
      const matchTime = match ? new Date(match.matchTime || match.date).getTime() : 0;
      if (match && (match.status !== 'NOT STARTED' || matchTime <= Date.now())) {
        return res.status(400).json({ message: 'Trận đấu đã bắt đầu, không thể thay đổi' });
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

      // Automatically add user to leaderboard for this tournament if they don't have an entry yet
      if (match && match.tournamentId) {
        const hasLeaderboard = await PredictionLeaderboardModel.findOne({
          userId,
          tournamentId: match.tournamentId
        });
        if (!hasLeaderboard) {
          await PredictionLeaderboardModel.create({
            userId,
            tournamentId: match.tournamentId,
            totalPoints: 0,
            exactMatches: 0,
            correctResults: 0
          });
        }
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
      let { tournamentId } = req.query;

      // Auto-sync: Ensure every USER account has a leaderboard entry for every tournament in DB
      try {
        const users = await AccountModel.find({ role: 'USER' });
        const tournaments = await mongoose.model('Tournament').find({});
        for (const u of users) {
          for (const t of tournaments) {
            const exists = await PredictionLeaderboardModel.exists({
              userId: u._id,
              tournamentId: t._id
            });
            if (!exists) {
              await PredictionLeaderboardModel.create({
                userId: u._id,
                tournamentId: t._id,
                totalPoints: 0,
                exactMatches: 0,
                correctResults: 0
              });
            }
          }
        }
      } catch (syncErr) {
        console.error("Lỗi đồng bộ leaderboard tự động:", syncErr);
      }

      if (!tournamentId) {
        // If not specified, default to the first tournament in DB
        const matchWithTournament = await MatchModel.findOne({ tournamentId: { $exists: true } }).select('tournamentId');
        if (matchWithTournament) {
          tournamentId = matchWithTournament.tournamentId;
        } else {
          // Fallback to any tournament
          const tournament = await mongoose.model('Tournament').findOne({});
          if (tournament) {
            tournamentId = tournament._id;
          }
        }
      }

      const query = tournamentId ? { tournamentId } : {};
      const leaderboard = await PredictionLeaderboardModel.find(query)
        .populate('userId', 'userName')
        .sort({ totalPoints: -1 });

      res.status(200).json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy bảng xếp hạng dự đoán', error: error.message });
    }
  }
};

export default predictionController;
