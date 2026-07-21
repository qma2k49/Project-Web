import MatchModel from '../models/match.model.js';
import MatchEventModel from '../models/matchEvent.model.js';
import MatchLineupModel from '../models/matchLineup.model.js';

export const getMatches = async (req, res) => {
  try {
    const matches = await MatchModel.find()
      .populate('homeTeam')
      .populate('awayTeam')
      .populate('stadium')
      .populate('refereeId')
      .populate('tournamentId')
      .sort({ createdAt: -1 });
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách trận đấu', error: error.message });
  }
};

export const getMatchById = async (req, res) => {
  try {
    const match = await MatchModel.findById(req.params.id)
      .populate('homeTeam')
      .populate('awayTeam')
      .populate('stadium')
      .populate('refereeId')
      .populate('tournamentId');
    if (!match) return res.status(404).json({ message: 'Không tìm thấy trận đấu' });
    
    const events = await MatchEventModel.find({ matchId: req.params.id }).sort({ minute: -1 });
    const lineup = await MatchLineupModel.find({ matchId: req.params.id }).populate('personId');

    res.status(200).json({ match, events, lineup });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thông tin chi tiết trận đấu', error: error.message });
  }
};

export const createMatch = async (req, res) => {
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
};

export const saveLineup = async (req, res) => {
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
};

export const triggerMatchEvent = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { type, minute, player, team, note } = req.body;

    const newEvent = await MatchEventModel.create({
      matchId,
      eventType: type,
      minute,
      note: `${player} (${team === 'home' ? 'Đội nhà' : 'Đội khách'}) - ${note || ''}`,
    });

    if (type === 'Goal') {
      const match = await MatchModel.findById(matchId);
      if (match) {
        if (team === 'home') match.homeScore += 1;
        if (team === 'away') match.awayScore += 1;
        await match.save();
      }
    }

    res.status(201).json({ message: 'Đã ghi nhận sự kiện trận đấu', event: newEvent });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi ghi nhận sự kiện trận đấu', error: error.message });
  }
};

export const deleteMatch = async (req, res) => {
  try {
    await MatchModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Đã xóa trận đấu' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa trận đấu', error: error.message });
  }
};
