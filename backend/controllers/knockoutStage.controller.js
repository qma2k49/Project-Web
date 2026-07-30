import KnockoutStageModel from "../models/knockoutStage.model.js";
import RoundNameTournementModel from "../models/roundNameTournement.model.js";

const knockoutStageController = {
  syncStages: async (req, res) => {
    try {
      const { tournamentId } = req.params;
      const { stages } = req.body; // array of { name, order, hasLeg2, hasThirdPlace }

      // 1. Delete existing KnockoutStages and their linked RoundNameTournement documents
      const existingStages = await KnockoutStageModel.find({ tournamentId });
      const stageIds = existingStages.map(s => s._id);
      
      await RoundNameTournementModel.deleteMany({ knockoutStageId: { $in: stageIds } });
      await KnockoutStageModel.deleteMany({ tournamentId });

      // 2. Insert new KnockoutStages and create their corresponding RoundNameTournement documents
      const createdStages = [];
      if (Array.isArray(stages)) {
        for (const s of stages) {
          const stageDoc = await KnockoutStageModel.create({
            tournamentId,
            name: s.name,
            order: s.order,
            hasLeg2: !!s.hasLeg2,
            hasThirdPlace: !!s.hasThirdPlace
          });
          createdStages.push(stageDoc);

          // Auto-create round names
          if (s.hasLeg2) {
            await RoundNameTournementModel.create({
              tournamentId,
              roundName: `${s.name} - Lượt đi`,
              knockoutStageId: stageDoc._id
            });
            await RoundNameTournementModel.create({
              tournamentId,
              roundName: `${s.name} - Lượt về`,
              knockoutStageId: stageDoc._id
            });
          } else {
            await RoundNameTournementModel.create({
              tournamentId,
              roundName: s.name,
              knockoutStageId: stageDoc._id
            });
          }

          if (s.hasThirdPlace) {
            await RoundNameTournementModel.create({
              tournamentId,
              roundName: `Tranh hạng ba (${s.name})`,
              knockoutStageId: stageDoc._id
            });
          }
        }
      }

      res.status(200).json(createdStages);
    } catch (error) {
      res.status(500).json({ message: "Lỗi đồng bộ vòng loại trực tiếp", error: error.message });
    }
  },

  getStagesByTournament: async (req, res) => {
    try {
      const { tournamentId } = req.params;
      const stages = await KnockoutStageModel.find({ tournamentId }).sort({ order: 1 });
      res.status(200).json(stages);
    } catch (error) {
      res.status(500).json({ 
        message: "Lỗi lấy danh sách vòng loại trực tiếp", 
        error: error.message 
      });
    }
  },

  createStage: async (req, res) => {
    try {
      const stage = await KnockoutStageModel.create(req.body);
      res.status(201).json(stage);
    } catch (error) {
      res.status(500).json({ 
        message: "Lỗi tạo vòng loại trực tiếp mới", 
        error: error.message 
      });
    }
  },

  updateStage: async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await KnockoutStageModel.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) {
        return res.status(404).json({ message: "Không tìm thấy vòng loại trực tiếp" });
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ 
        message: "Lỗi cập nhật vòng loại trực tiếp", 
        error: error.message 
      });
    }
  },

  deleteStage: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await KnockoutStageModel.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ message: "Không tìm thấy vòng loại trực tiếp" });
      }
      res.status(200).json({ message: "Đã xóa vòng loại trực tiếp" });
    } catch (error) {
      res.status(500).json({ 
        message: "Lỗi xóa vòng loại trực tiếp", 
        error: error.message 
      });
    }
  }
};

export default knockoutStageController;
