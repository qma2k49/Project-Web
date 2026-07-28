import TournamentModel from '../models/tournament.model.js';

const defaultTournaments = [
  {
    name: "ASEAN Hyundai Cup 2026",
    season: "2026",
    type: "CUP",
    status: "ONGOING",
    startDate: new Date("2026-07-24T00:00:00.000Z"),
    endDate: new Date("2026-08-26T00:00:00.000Z"),
  }
];

const getStatusByDates = (startDate, endDate) => {
  if (!startDate) return 'PENDING';
  const now = new Date();
  const start = new Date(startDate);
  if (now < start) return 'PENDING'; // Chưa bắt đầu

  if (endDate) {
    const end = new Date(endDate);
    if (now > end) return 'COMPLETED'; // Kết thúc
  }
  return 'ONGOING'; // Đang diễn ra
};

const tournamentController = {
  getTournaments: async (req, res) => {
    try {
      let tournaments = await TournamentModel.find().populate('groups.teams');
      if (tournaments.length === 0) {
        tournaments = await TournamentModel.insertMany(defaultTournaments);
      }

      // Update statuses dynamically and synchronize with database
      const updatedTournaments = await Promise.all(
        tournaments.map(async (t) => {
          const computedStatus = getStatusByDates(t.startDate, t.endDate);
          if (t.status !== computedStatus) {
            t.status = computedStatus;
            await t.save();
          }
          return t;
        })
      );

      res.status(200).json(updatedTournaments);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy danh sách giải đấu', error: error.message });
    }
  },

  getTournamentById: async (req, res) => {
    try {
      const tournament = await TournamentModel.findById(req.params.id).populate('groups.teams');
      if (!tournament) {
        return res.status(404).json({ message: 'Không tìm thấy giải đấu' });
      }

      const computedStatus = getStatusByDates(tournament.startDate, tournament.endDate);
      if (tournament.status !== computedStatus) {
        tournament.status = computedStatus;
        await tournament.save();
      }

      res.status(200).json(tournament);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy thông tin giải đấu', error: error.message });
    }
  },

  createTournament: async (req, res) => {
    try {
      if (req.body.startDate) {
        req.body.status = getStatusByDates(req.body.startDate, req.body.endDate);
      }
      const created = await TournamentModel.create(req.body);
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi tạo giải đấu mới', error: error.message });
    }
  },

  updateTournament: async (req, res) => {
    try {
      if (req.body.startDate !== undefined || req.body.endDate !== undefined) {
        const existing = await TournamentModel.findById(req.params.id);
        if (existing) {
          const mergedStart = req.body.startDate !== undefined ? req.body.startDate : existing.startDate;
          const mergedEnd = req.body.endDate !== undefined ? req.body.endDate : existing.endDate;
          req.body.status = getStatusByDates(mergedStart, mergedEnd);
        }
      }
      const updated = await TournamentModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi cập nhật giải đấu', error: error.message });
    }
  },

  deleteTournament: async (req, res) => {
    try {
      await TournamentModel.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Đã xóa giải đấu' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi xóa giải đấu', error: error.message });
    }
  }
};

export default tournamentController;
