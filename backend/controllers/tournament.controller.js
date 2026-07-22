import TournamentModel from '../models/tournament.model.js';


export const getTournaments = async (req, res) => {
  try {
    let tournaments = await TournamentModel.find().populate('groups.teams');
    if (tournaments.length === 0) {
      tournaments = await TournamentModel.insertMany(defaultTournaments);
    }
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách giải đấu', error: error.message });
  }
};

export const getTournamentById = async (req, res) => {
  try {
    const tournament = await TournamentModel.findById(req.params.id).populate('groups.teams');
    if (!tournament) {
      return res.status(404).json({ message: 'Không tìm thấy giải đấu' });
    }
    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thông tin giải đấu', error: error.message });
  }
};

export const createTournament = async (req, res) => {
  try {
    const created = await TournamentModel.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo giải đấu mới', error: error.message });
  }
};

export const updateTournament = async (req, res) => {
  try {
    const updated = await TournamentModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật giải đấu', error: error.message });
  }
};

export const deleteTournament = async (req, res) => {
  try {
    await TournamentModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Đã xóa giải đấu' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa giải đấu', error: error.message });
  }
};
