import MatchModel from '../models/match.model.js';
import MatchEventModel from '../models/matchEvent.model.js';
import MatchLineupModel from '../models/matchLineup.model.js';
import PredictionModel from '../models/prediction.model.js';
import PredictionLeaderboardModel from '../models/predictionLeaderboard.model.js';

const matchController = {
  getMatches: async (req, res) => {
    try {
      const matches = await MatchModel.find()
        .populate('homeTeam')
        .populate('awayTeam')
        .populate('stadium')
        .populate('refereeId')
        .populate('tournamentId')
        .sort({ createdAt: -1 });

      const liveMatchIds = matches.filter(m => m.status === 'LIVE').map(m => m._id);
      const clockEvents = await MatchEventModel.find({
        matchId: { $in: liveMatchIds },
        eventType: { $in: ['StartHalf', 'EndHalf'] }
      }).sort({ createdAt: -1 });

      const matchesJson = matches.map(m => {
        const matchObj = m.toObject();
        if (matchObj.status === 'LIVE') {
          const eventsForMatch = clockEvents.filter(e => String(e.matchId) === String(matchObj._id));
          if (eventsForMatch.length > 0) {
            const latestEvent = eventsForMatch[0];
            if (latestEvent.eventType === 'StartHalf') {
              const startTime = new Date(latestEvent.createdAt);
              const now = new Date();
              const elapsed = Math.max(0, Math.floor((now - startTime) / 1000));
              const baseSeconds = (latestEvent.minute - 1) * 60;
              matchObj.elapsedSeconds = baseSeconds + elapsed;
              matchObj.clockRunning = true;
            } else {
              matchObj.elapsedSeconds = latestEvent.minute * 60;
              matchObj.clockRunning = false;
            }
          } else {
            matchObj.elapsedSeconds = 0;
            matchObj.clockRunning = false;
          }
        } else if (matchObj.status === 'FINISHED') {
          matchObj.elapsedSeconds = 90 * 60;
          matchObj.clockRunning = false;
        } else {
          matchObj.elapsedSeconds = 0;
          matchObj.clockRunning = false;
        }
        return matchObj;
      });

      res.status(200).json(matchesJson);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy danh sách trận đấu', error: error.message });
    }
  },

  getMatchById: async (req, res) => {
    try {
      const match = await MatchModel.findById(req.params.id)
        .populate('homeTeam')
        .populate('awayTeam')
        .populate('stadium')
        .populate('refereeId')
        .populate('tournamentId');
      if (!match) return res.status(404).json({ message: 'Không tìm thấy trận đấu' });
      
      const events = await MatchEventModel.find({ matchId: req.params.id }).sort({ createdAt: -1 });
      const lineup = await MatchLineupModel.find({ matchId: req.params.id }).populate('personId');

      const matchObj = match.toObject();
      if (matchObj.status === 'LIVE') {
        const clockEvents = events.filter(e => e.eventType === 'StartHalf' || e.eventType === 'EndHalf');
        if (clockEvents.length > 0) {
          const latestEvent = clockEvents[0];
          if (latestEvent.eventType === 'StartHalf') {
            const startTime = new Date(latestEvent.createdAt);
            const now = new Date();
            const elapsed = Math.max(0, Math.floor((now - startTime) / 1000));
            const baseSeconds = (latestEvent.minute - 1) * 60;
            matchObj.elapsedSeconds = baseSeconds + elapsed;
            matchObj.clockRunning = true;
          } else {
            matchObj.elapsedSeconds = latestEvent.minute * 60;
            matchObj.clockRunning = false;
          }
        } else {
          matchObj.elapsedSeconds = 0;
          matchObj.clockRunning = false;
        }
      } else if (matchObj.status === 'FINISHED') {
        matchObj.elapsedSeconds = 90 * 60;
        matchObj.clockRunning = false;
      } else {
        matchObj.elapsedSeconds = 0;
        matchObj.clockRunning = false;
      }

      res.status(200).json({ match: matchObj, events, lineup });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy thông tin chi tiết trận đấu', error: error.message });
    }
  },

  createMatch: async (req, res) => {
    try {
      const created = await MatchModel.create(req.body);
      const populated = await MatchModel.findById(created._id)
        .populate('homeTeam')
        .populate('awayTeam')
        .populate('stadium')
        .populate('tournamentId');
      res.status(201).json(populated);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi tạo lịch trận đấu', error: error.message });
    }
  },

  saveLineup: async (req, res) => {
    try {
      const { matchId } = req.params;
      const { starters, substitutes } = req.body;
      
      await MatchLineupModel.deleteMany({ matchId });

      const lineupRecords = [];
      if (starters && Array.isArray(starters)) {
        starters.forEach(personId => {
          lineupRecords.push({ matchId, personId, isStarter: true });
        });
      }
      if (substitutes && Array.isArray(substitutes)) {
        substitutes.forEach(personId => {
          lineupRecords.push({ matchId, personId, isStarter: false });
        });
      }

      const created = await MatchLineupModel.insertMany(lineupRecords);
      res.status(200).json({ message: 'Đã lưu đội hình MatchLineup thành công', count: created.length });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lưu đội hình MatchLineup', error: error.message });
    }
  },

  triggerMatchEvent: async (req, res) => {
    try {
      const { matchId } = req.params;
      const { type, minute, player, team, note, stoppageMinute = 0, personId, outgoingPlayerId, incomingPlayerId } = req.body;
      const displayMinute = stoppageMinute > 0 ? `${minute}+${stoppageMinute}` : minute;

      const newEvent = await MatchEventModel.create({
        matchId,
        eventType: type,
        minute,
        stoppageMinute,
        personId,
        outgoingPlayerId,
        incomingPlayerId,
        note: `${displayMinute} - ${player} (${team === 'home' ? 'Đội nhà' : 'Đội khách'}) - ${note || ''}`,
      });

      if (type === 'Goal') {
        const match = await MatchModel.findById(matchId);
        if (match) {
          if (team === 'home') match.homeScore += 1;
          if (team === 'away') match.awayScore += 1;
          await match.save();
        }
      }

      if (type === 'StartHalf') {
        const match = await MatchModel.findById(matchId);
        if (match && match.status !== 'LIVE') {
          match.status = 'LIVE';
          await match.save();
        }
      }

      if (type === 'EndHalf') {
        const match = await MatchModel.findById(matchId);
        // If it is the end of the second half (90th minute event), set match to FINISHED
        if (match && minute >= 90) {
          match.status = 'FINISHED';
          await match.save();

          // Calculate predictions for this finished match
          try {
            const predictions = await PredictionModel.find({ matchId });
            for (const pred of predictions) {
              const homeScore = match.homeScore || 0;
              const awayScore = match.awayScore || 0;
              const predHome = pred.predictedHomeScore || 0;
              const predAway = pred.predictedAwayScore || 0;

              const exactMatch = (predHome === homeScore && predAway === awayScore);
              const realResult = Math.sign(homeScore - awayScore);
              const predResult = Math.sign(predHome - predAway);
              const correctResult = (realResult === predResult);

              let points = 0;
              if (exactMatch) points = 3;
              else if (correctResult) points = 1;

              pred.pointsEarned = points;
              pred.status = 'FINISHED';
              await pred.save();

              // Update the leaderboard entry for this user
              let leaderboardEntry = await PredictionLeaderboardModel.findOne({
                userId: pred.userId,
                tournamentId: match.tournamentId
              });

              if (!leaderboardEntry) {
                leaderboardEntry = await PredictionLeaderboardModel.create({
                  userId: pred.userId,
                  tournamentId: match.tournamentId,
                  totalPoints: 0,
                  exactMatches: 0,
                  correctResults: 0
                });
              }

              leaderboardEntry.totalPoints += points;
              if (exactMatch) {
                leaderboardEntry.exactMatches += 1;
              } else if (correctResult) {
                leaderboardEntry.correctResults += 1;
              }
              await leaderboardEntry.save();
            }
          } catch (predError) {
            console.error("Lỗi tự động cập nhật điểm dự đoán:", predError);
          }
        }
      }

      res.status(201).json({ message: 'Đã ghi nhận sự kiện trận đấu', event: newEvent });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi ghi nhận sự kiện trận đấu', error: error.message });
    }
  },

  deleteMatch: async (req, res) => {
    try {
      await MatchModel.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Đã xóa trận đấu' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi xóa trận đấu', error: error.message });
    }
  }
};

export default matchController;
