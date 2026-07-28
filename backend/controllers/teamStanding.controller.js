import TeamStandingModel from '../models/teamStandings.model.js';
import MatchModel from '../models/match.model.js';

const teamStandingController = {
  getTeamStandingsByTournament: async (req, res) => {
    try {
      const { tournamentId } = req.params;
      const standings = await TeamStandingModel.find({ tournamentId })
        .populate('teamId')
        .sort({ points: -1, goalDifference: -1, goalsFor: -1 });
      res.status(200).json(standings);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy bảng xếp hạng giải đấu', error: error.message });
    }
  },

  createOrUpdateTeamStanding: async (req, res) => {
    try {
      const { tournamentId, teamId, matchesPlayed, won, drawn, lost, goalsFor, goalsAgainst } = req.body;

      const goalDifference = (goalsFor || 0) - (goalsAgainst || 0);
      const points = (won || 0) * 3 + (drawn || 0) * 1;

      const standing = await TeamStandingModel.findOneAndUpdate(
        { tournamentId, teamId },
        {
          matchesPlayed,
          won,
          drawn,
          lost,
          goalsFor,
          goalsAgainst,
          goalDifference,
          points,
        },
        { new: true, upsert: true }
      ).populate('teamId');

      res.status(200).json({ message: 'Cập nhật BXH thành công', standing });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi cập nhật BXH', error: error.message });
    }
  },

  recalculateTournamentStandings: async (req, res) => {
    try {
      const { tournamentId } = req.params;
      const finishedMatches = await MatchModel.find({
        tournamentId,
        status: 'FINISHED',
      });

      const statsMap = {}; // teamId -> { matchesPlayed, won, drawn, lost, goalsFor, goalsAgainst }

      finishedMatches.forEach((match) => {
        const homeId = match.homeTeam.toString();
        const awayId = match.awayTeam.toString();

        if (!statsMap[homeId]) {
          statsMap[homeId] = { matchesPlayed: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 };
        }
        if (!statsMap[awayId]) {
          statsMap[awayId] = { matchesPlayed: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 };
        }

        statsMap[homeId].matchesPlayed += 1;
        statsMap[awayId].matchesPlayed += 1;

        statsMap[homeId].goalsFor += match.homeScore;
        statsMap[homeId].goalsAgainst += match.awayScore;

        statsMap[awayId].goalsFor += match.awayScore;
        statsMap[awayId].goalsAgainst += match.homeScore;

        if (match.homeScore > match.awayScore) {
          statsMap[homeId].won += 1;
          statsMap[awayId].lost += 1;
        } else if (match.homeScore < match.awayScore) {
          statsMap[awayId].won += 1;
          statsMap[homeId].lost += 1;
        } else {
          statsMap[homeId].drawn += 1;
          statsMap[awayId].drawn += 1;
        }
      });

      const updatePromises = Object.keys(statsMap).map(async (teamId) => {
        const st = statsMap[teamId];
        const goalDifference = st.goalsFor - st.goalsAgainst;
        const points = st.won * 3 + st.drawn * 1;

        return TeamStandingModel.findOneAndUpdate(
          { tournamentId, teamId },
          { ...st, goalDifference, points },
          { new: true, upsert: true }
        );
      });

      await Promise.all(updatePromises);
      const updatedStandings = await TeamStandingModel.find({ tournamentId })
        .populate('teamId')
        .sort({ points: -1, goalDifference: -1, goalsFor: -1 });

      res.status(200).json({ message: 'Tự động tính lại BXH thành công', standings: updatedStandings });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi tự động tính BXH', error: error.message });
    }
  },

  deleteTeamStanding: async (req, res) => {
    try {
      await TeamStandingModel.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Đã xóa bản ghi BXH' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi xóa bản ghi BXH', error: error.message });
    }
  }
};

export default teamStandingController;
