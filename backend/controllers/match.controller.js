import MatchModel from '../models/match.model.js';
import MatchEventModel from '../models/matchEvent.model.js';
import MatchLineupModel from '../models/matchLineup.model.js';
import PredictionModel from '../models/prediction.model.js';
import PredictionLeaderboardModel from '../models/predictionLeaderboard.model.js';
import mongoose from 'mongoose';

const matchController = {
  getMatches: async (req, res) => {
    try {
      const matches = await MatchModel.find()
        .populate('homeTeam')
        .populate('awayTeam')
        .populate('stadium')
        .populate('refereeId')
        .populate('tournamentId')
        .populate('roundName')
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
        .populate('tournamentId')
        .populate('roundName');
      if (!match) return res.status(404).json({ message: 'Không tìm thấy trận đấu' });
      
      const events = await MatchEventModel.find({ matchId: req.params.id })
        .populate('personId')
        .populate('outgoingPlayerId')
        .populate('incomingPlayerId')
        .sort({ createdAt: -1 });
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
        .populate('tournamentId')
        .populate('roundName');
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
      const { type, minute, player, team, note, stoppageMinute = 0, personId, assistPlayerId, outgoingPlayerId, incomingPlayerId } = req.body;
      const displayMinute = stoppageMinute > 0 ? `${minute}+${stoppageMinute}` : minute;

      // Find player jersey number if personId exists
      let shirtPrefix = "";
      if (personId) {
        const playerObj = await mongoose.model('Person').findById(personId);
        if (playerObj && playerObj.get('jerseyNumber') !== undefined) {
          shirtPrefix = `[#${playerObj.get('jerseyNumber')}] `;
        }
      }

      let eventNote = "";
      if (type === 'StartHalf' || type === 'EndHalf') {
        eventNote = note || (type === 'StartHalf' ? 'Bắt đầu hiệp đấu' : 'Kết thúc hiệp đấu');
      } else {
        let assistSuffix = "";
        if (assistPlayerId) {
          const assisterObj = await mongoose.model('Person').findById(assistPlayerId);
          if (assisterObj) {
            const assistShirt = assisterObj.get('jerseyNumber') !== undefined ? ` [#${assisterObj.get('jerseyNumber')}]` : "";
            assistSuffix = ` (Kiến tạo: ${assisterObj.name}${assistShirt})`;
          }
        }
        eventNote = `${shirtPrefix}${player || ''}${assistSuffix} (${team === 'home' ? 'Đội nhà' : 'Đội khách'}) - ${note || ''}`.trim();
      }

      const newEvent = await MatchEventModel.create({
        matchId,
        eventType: type,
        minute,
        stoppageMinute,
        personId,
        assistPlayerId,
        outgoingPlayerId,
        incomingPlayerId,
        note: eventNote,
      });

      const match = await MatchModel.findById(matchId);
      if (match) {
        const tournamentId = match.tournamentId;
        const PlayerStandingModel = mongoose.model('PlayerStanding');

        if (type === 'Goal') {
          if (team === 'home') match.homeScore += 1;
          if (team === 'away') match.awayScore += 1;
          await match.save();

          // Scorer Goals
          if (personId) {
            const teamId = team === 'home' ? match.homeTeam : match.awayTeam;
            await PlayerStandingModel.findOneAndUpdate(
              { tournamentId, playerId: personId },
              { $inc: { goals: 1 }, $setOnInsert: { teamId } },
              { upsert: true }
            );
          }

          // Assist Player Assists
          if (assistPlayerId) {
            const teamId = team === 'home' ? match.homeTeam : match.awayTeam;
            await PlayerStandingModel.findOneAndUpdate(
              { tournamentId, playerId: assistPlayerId },
              { $inc: { assists: 1 }, $setOnInsert: { teamId } },
              { upsert: true }
            );
          }
        } else if (type === 'YellowCard' && personId) {
          const teamId = team === 'home' ? match.homeTeam : match.awayTeam;
          await PlayerStandingModel.findOneAndUpdate(
            { tournamentId, playerId: personId },
            { $inc: { yellowCards: 1 }, $setOnInsert: { teamId } },
            { upsert: true }
          );
        } else if (type === 'RedCard' && personId) {
          const teamId = team === 'home' ? match.homeTeam : match.awayTeam;
          await PlayerStandingModel.findOneAndUpdate(
            { tournamentId, playerId: personId },
            { $inc: { redCards: 1 }, $setOnInsert: { teamId } },
            { upsert: true }
          );
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
            
            // Find first Goal event for this match to check correct first scorer player
            const firstGoalEvent = await MatchEventModel.findOne({
              matchId: match._id,
              eventType: 'Goal'
            }).sort({ minute: 1, stoppageMinute: 1 });

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

              // 1. Đoán đúng thắng/hòa/thua: +5 điểm
              if (correctOutcome) {
                points += 5;
              }

              // 2. Đúng bàn thắng của đội nào thì +3 điểm nữa
              if (predHome === homeScore) {
                points += 3;
              }
              if (predAway === awayScore) {
                points += 3;
              }

              // 3. Đúng cầu thủ ghi bàn: +10 điểm
              if (firstGoalEvent && pred.firstScorePlayer && String(firstGoalEvent.personId) === String(pred.firstScorePlayer)) {
                points += 10;
              }

              // 4. Đúng khoảng cách bàn thắng giữa 2 đội (với điều kiện đúng thắng/hòa/thua): +10 điểm
              if (correctOutcome) {
                const realDiff = homeScore - awayScore;
                const predDiff = predHome - predAway;
                if (realDiff === predDiff) {
                  points += 10;
                }
              }

              // 5. Nếu chọn boost x2 thì cộng toàn bộ điểm ghi được rồi x2 lên
              if (pred.x2Bonus) {
                points = points * 2;
              }

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
              } else if (correctOutcome) {
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
