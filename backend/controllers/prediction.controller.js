import PredictionModel from '../models/prediction.model.js';
import PredictionLeaderboardModel from '../models/predictionLeaderboard.model.js';
import MatchModel from '../models/match.model.js';
import AccountModel from '../models/account.model.js';
import mongoose from 'mongoose';

const predictionController = {
  submitPrediction: async (req, res) => {
    try {
      const { matchId, homeScore, awayScore, x2Bonus = false, firstScorePlayer = null } = req.body;
      const userId = req.user.id;

      // Check if match status is NOT STARTED and kickoff time is in the future
      const match = await MatchModel.findById(matchId);
      const matchTime = match ? new Date(match.matchTime || match.date).getTime() : 0;
      if (match && (match.status !== 'NOT STARTED' || matchTime <= Date.now())) {
        return res.status(400).json({ message: 'Trận đấu đã bắt đầu, không thể thay đổi' });
      }

      // Check if user has already used x2 bonus in this round of the tournament
      if (x2Bonus && match) {
        const siblingMatches = await MatchModel.find({
          tournamentId: match.tournamentId,
          roundName: match.roundName,
          _id: { $ne: match._id }
        }).select('_id');
        
        const siblingMatchIds = siblingMatches.map(m => m._id);
        const existingX2 = await PredictionModel.findOne({
          userId,
          matchId: { $in: siblingMatchIds },
          x2Bonus: true
        });

        if (existingX2) {
          return res.status(400).json({ message: 'Bạn đã sử dụng boost x2 cho một trận đấu khác trong vòng đấu này rồi!' });
        }
      }

      let prediction = await PredictionModel.findOne({ userId, matchId });
      if (prediction) {
        prediction.predictedHomeScore = homeScore;
        prediction.predictedAwayScore = awayScore;
        prediction.x2Bonus = x2Bonus;
        prediction.firstScorePlayer = firstScorePlayer || null;
        await prediction.save();
      } else {
        prediction = await PredictionModel.create({
          userId,
          matchId,
          predictedHomeScore: homeScore,
          predictedAwayScore: awayScore,
          x2Bonus,
          firstScorePlayer: firstScorePlayer || null,
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
  },

  getAllPredictions: async (req, res) => {
    try {
      const predictions = await PredictionModel.find({})
        .populate('userId', 'userName')
        .populate({
          path: 'matchId',
          populate: [
            { path: 'homeTeam', select: 'name shortName logo' },
            { path: 'awayTeam', select: 'name shortName logo' },
            { path: 'tournamentId', select: 'name' },
            { path: 'roundName', select: 'roundName' }
          ]
        })
        .populate('firstScorePlayer', 'name jerseyNumber');
      res.status(200).json(predictions);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy tất cả dự đoán', error: error.message });
    }
  },

  updateLeaderboardScore: async (req, res) => {
    try {
      const { id } = req.params;
      const { totalPoints, exactMatches, correctResults } = req.body;
      const record = await PredictionLeaderboardModel.findByIdAndUpdate(
        id,
        { totalPoints: Number(totalPoints), exactMatches: Number(exactMatches), correctResults: Number(correctResults) },
        { new: true }
      ).populate('userId', 'userName');
      
      if (!record) {
        return res.status(404).json({ message: 'Không tìm thấy bản ghi bảng xếp hạng' });
      }
      res.status(200).json({ message: 'Cập nhật điểm bảng xếp hạng thành công', record });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi cập nhật điểm bảng xếp hạng', error: error.message });
    }
  },

  recalculatePoints: async (req, res) => {
    try {
      const { tournamentId } = req.body;
      if (!tournamentId) {
        return res.status(400).json({ message: 'Thiếu tournamentId' });
      }

      // 1. Reset leaderboard for this tournament
      await PredictionLeaderboardModel.updateMany(
        { tournamentId },
        { totalPoints: 0, exactMatches: 0, correctResults: 0 }
      );

      // 2. Fetch all finished matches in this tournament
      const matches = await MatchModel.find({ tournamentId, status: 'FINISHED' });

      const MatchEventModel = mongoose.model('MatchEvent');

      for (const match of matches) {
        // Find first goal event
        const firstGoalEvent = await MatchEventModel.findOne({
          matchId: match._id,
          eventType: 'Goal'
        }).sort({ minute: 1, stoppageMinute: 1 });

        const predictions = await PredictionModel.find({ matchId: match._id });

        for (const pred of predictions) {
          const homeScore = match.homeScore || 0;
          const awayScore = match.awayScore || 0;
          const predHome = pred.predictedHomeScore || 0;
          const predAway = pred.predictedAwayScore || 0;

          const exactMatch = (predHome === homeScore && predAway === awayScore);
          const realResult = Math.sign(homeScore - awayScore);
          const predResult = Math.sign(predHome - predAway);
          const correctOutcome = (realResult === predResult);

          let points = 0;

          // 1. Correct outcome: +5
          if (correctOutcome) points += 5;

          // 2. Correct team score: +3 each
          if (predHome === homeScore) points += 3;
          if (predAway === awayScore) points += 3;

          // 3. Correct first goal scorer: +10
          if (firstGoalEvent && pred.firstScorePlayer && String(firstGoalEvent.personId) === String(pred.firstScorePlayer)) {
            points += 10;
          }

          // 4. Correct goal difference (if outcome is correct): +10
          if (correctOutcome) {
            const realDiff = homeScore - awayScore;
            const predDiff = predHome - predAway;
            if (realDiff === predDiff) {
              points += 10;
            }
          }

          // 5. Boost x2
          if (pred.x2Bonus) {
            points = points * 2;
          }

          pred.pointsEarned = points;
          pred.status = 'FINISHED';
          await pred.save();

          // Accumulate on leaderboard
          let leaderboardEntry = await PredictionLeaderboardModel.findOne({
            userId: pred.userId,
            tournamentId
          });

          if (!leaderboardEntry) {
            leaderboardEntry = await PredictionLeaderboardModel.create({
              userId: pred.userId,
              tournamentId,
              totalPoints: 0,
              exactMatches: 0,
              correctResults: 0
            });
          }

          leaderboardEntry.totalPoints += points;
          if (exactMatch) {
            leaderboardEntry.exactMatches += 1;
          } else if (correctOutcome) {
            leaderboardEntry.correctResults += 1;
          }
          await leaderboardEntry.save();
        }
      }

      res.status(200).json({ message: 'Tính toán lại điểm dự đoán giải đấu thành công!' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi tính toán lại điểm dự đoán', error: error.message });
    }
  }
};

export default predictionController;
