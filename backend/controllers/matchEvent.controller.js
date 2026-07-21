import MatchEventModel from '../models/matchEvent.model.js';
import MatchModel from '../models/match.model.js';

export const getEventsByMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const events = await MatchEventModel.find({ matchId })
      .populate('teamId')
      .populate('personId')
      .sort({ minute: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách sự kiện trận đấu', error: error.message });
  }
};

export const createMatchEvent = async (req, res) => {
  try {
    const { matchId, teamId, personId, minute, eventType, note } = req.body;

    const event = await MatchEventModel.create({
      matchId,
      teamId,
      personId,
      minute,
      eventType,
      note,
    });

    if (eventType === 'Goal' || eventType === 'OwnGoal') {
      const match = await MatchModel.findById(matchId);
      if (match) {
        if (eventType === 'Goal') {
          if (teamId && teamId.toString() === match.homeTeam.toString()) {
            match.homeScore += 1;
          } else {
            match.awayScore += 1;
          }
        } else if (eventType === 'OwnGoal') {
          if (teamId && teamId.toString() === match.homeTeam.toString()) {
            match.awayScore += 1;
          } else {
            match.homeScore += 1;
          }
        }
        await match.save();
      }
    }

    res.status(201).json({ message: 'Đã tạo sự kiện trận đấu mới', event });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo sự kiện trận đấu', error: error.message });
  }
};

export const deleteMatchEvent = async (req, res) => {
  try {
    await MatchEventModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Đã xóa sự kiện trận đấu' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa sự kiện trận đấu', error: error.message });
  }
};
