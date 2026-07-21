import mongoose from "mongoose";

const playerStandingSchema = new mongoose.Schema({
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
        required: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },

    // Các chỉ số chuyên môn trong khuôn khổ giải đấu này
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 },
    matchesPlayed: { type: Number, default: 0 },
    minutesPlayed: { type: Number, default: 0 }
}, { timestamps: true });

// Ràng buộc: 1 cầu thủ chỉ có 1 bản ghi thống kê trong 1 giải đấu
playerStandingSchema.index({ tournamentId: 1, playerId: 1 }, { unique: true });

// Đánh Index để tối ưu tốc độ query danh sách Vua phá lưới (sắp xếp bàn thắng giảm dần)
playerStandingSchema.index({ tournamentId: 1, goals: -1 });

const PlayerStandingModel = mongoose.model('PlayerStanding', playerStandingSchema);

export default PlayerStandingModel;