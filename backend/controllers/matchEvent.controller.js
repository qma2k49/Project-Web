import MatchEventModel from '../models/matchEvent.model.js';
import MatchModel from '../models/match.model.js';
import mongoose from 'mongoose';

const matchEventController = {
  getEventsByMatch: async (req, res) => {
    try {
      const { matchId } = req.params;
      const events = await MatchEventModel.find({ matchId })
        .populate('teamId')
        .populate('personId')
        .populate('assistPlayerId')
        .populate('outgoingPlayerId')
        .populate('incomingPlayerId')
        .sort({ minute: 1 });
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy danh sách sự kiện trận đấu', error: error.message });
    }
  },

  createMatchEvent: async (req, res) => {
    try {
      const { matchId, teamId, personId, assistPlayerId, outgoingPlayerId, incomingPlayerId, minute, stoppageMinute = 0, eventType, note } = req.body;
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
      if (eventType === 'StartHalf' || eventType === 'EndHalf') {
        eventNote = note || (eventType === 'StartHalf' ? 'Bắt đầu hiệp đấu' : 'Kết thúc hiệp đấu');
      } else {
        let assistSuffix = "";
        if (assistPlayerId) {
          const assisterObj = await mongoose.model('Person').findById(assistPlayerId);
          if (assisterObj) {
            const assistShirt = assisterObj.get('jerseyNumber') !== undefined ? ` [#${assisterObj.get('jerseyNumber')}]` : "";
            assistSuffix = ` (Kiến tạo: ${assisterObj.name}${assistShirt})`;
          }
        }
        eventNote = `${shirtPrefix}${note || ''}${assistSuffix}`.trim();
      }

      const event = await MatchEventModel.create({
        matchId,
        teamId,
        personId,
        assistPlayerId,
        outgoingPlayerId,
        incomingPlayerId,
        minute,
        stoppageMinute,
        eventType,
        note: eventNote,
      });

      const match = await MatchModel.findById(matchId);
      if (match) {
        const tournamentId = match.tournamentId;
        const PlayerStandingModel = mongoose.model('PlayerStanding');

        if (eventType === 'Goal' || eventType === 'OwnGoal') {
          if (eventType === 'Goal') {
            if (teamId && teamId.toString() === match.homeTeam.toString()) {
              match.homeScore += 1;
            } else {
              match.awayScore += 1;
            }

            // Update stats: Scorer Goal Tally
            if (personId) {
              await PlayerStandingModel.findOneAndUpdate(
                { tournamentId, playerId: personId },
                { $inc: { goals: 1 }, $setOnInsert: { teamId } },
                { upsert: true }
              );
            }

            // Update stats: Assist Player Assist Tally
            if (assistPlayerId) {
              await PlayerStandingModel.findOneAndUpdate(
                { tournamentId, playerId: assistPlayerId },
                { $inc: { assists: 1 }, $setOnInsert: { teamId } },
                { upsert: true }
              );
            }
          } else if (eventType === 'OwnGoal') {
            if (teamId && teamId.toString() === match.homeTeam.toString()) {
              match.awayScore += 1;
            } else {
              match.homeScore += 1;
            }
          }
          await match.save();
        } else if (eventType === 'YellowCard' && personId) {
          await PlayerStandingModel.findOneAndUpdate(
            { tournamentId, playerId: personId },
            { $inc: { yellowCards: 1 }, $setOnInsert: { teamId } },
            { upsert: true }
          );
        } else if (eventType === 'RedCard' && personId) {
          await PlayerStandingModel.findOneAndUpdate(
            { tournamentId, playerId: personId },
            { $inc: { redCards: 1 }, $setOnInsert: { teamId } },
            { upsert: true }
          );
        }
      }

      res.status(201).json({ message: 'Đã tạo sự kiện trận đấu mới', event });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi tạo sự kiện trận đấu', error: error.message });
    }
  },

  deleteMatchEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const event = await MatchEventModel.findById(id);
      if (!event) {
        return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
      }

      const match = await MatchModel.findById(event.matchId);
      if (match) {
        const tournamentId = match.tournamentId;
        const PlayerStandingModel = mongoose.model('PlayerStanding');

        if (event.eventType === 'Goal') {
          if (event.teamId && event.teamId.toString() === match.homeTeam.toString()) {
            match.homeScore = Math.max(0, match.homeScore - 1);
          } else {
            match.awayScore = Math.max(0, match.awayScore - 1);
          }

          // Decrement scorer goals
          if (event.personId) {
            await PlayerStandingModel.findOneAndUpdate(
              { tournamentId, playerId: event.personId },
              { $inc: { goals: -1 } }
            );
          }

          // Decrement assist player assists
          if (event.assistPlayerId) {
            await PlayerStandingModel.findOneAndUpdate(
              { tournamentId, playerId: event.assistPlayerId },
              { $inc: { assists: -1 } }
            );
          }

          await match.save();
        } else if (event.eventType === 'OwnGoal') {
          if (event.teamId && event.teamId.toString() === match.homeTeam.toString()) {
            match.awayScore = Math.max(0, match.awayScore - 1);
          } else {
            match.homeScore = Math.max(0, match.homeScore - 1);
          }
          await match.save();
        } else if (event.eventType === 'YellowCard' && event.personId) {
          await PlayerStandingModel.findOneAndUpdate(
            { tournamentId, playerId: event.personId },
            { $inc: { yellowCards: -1 } }
          );
        } else if (event.eventType === 'RedCard' && event.personId) {
          await PlayerStandingModel.findOneAndUpdate(
            { tournamentId, playerId: event.personId },
            { $inc: { redCards: -1 } }
          );
        }
      }

      await MatchEventModel.findByIdAndDelete(id);
      res.status(200).json({ message: 'Đã xóa sự kiện trận đấu' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi xóa sự kiện trận đấu', error: error.message });
    }
  }
};

export default matchEventController;
