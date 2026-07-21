import mongoose from "mongoose";
const teamStandingSchema = new mongoose.Schema({
    tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },

    // Các chỉ số CHỈ tính riêng cho giải đấu này
    matchesPlayed: { type: Number, default: 0 },
    won: { type: Number, default: 0 },
    drawn: { type: Number, default: 0 },
    lost: { type: Number, default: 0 },
    goalsFor: { type: Number, default: 0 },
    goalsAgainst: { type: Number, default: 0 },
    goalDifference: { type: Number, default: 0 },
    points: { type: Number, default: 0 }
}, { timestamps: true });

// ràng buộc: 1 đội chỉ có 1 dòng thống kê trong 1 giải đấu
teamStandingSchema.index({ tournamentId: 1, teamId: 1 }, { unique: true });
teamStandingSchema.index({ tournamentId: 1, points: -1, goalDifference: -1 });

const TeamStandingModel = mongoose.model('TeamStanding', teamStandingSchema);

export default TeamStandingModel;