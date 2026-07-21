import mongoose from "mongoose";

const matchLineupSchema = new mongoose.Schema({
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    formation: {
        type: String,
        default: '4-3-3' // Ví dụ: "4-4-2", "3-5-2"
    },
    startingXI: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person'
    }],
    substitutes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person'
    }]
}, { timestamps: true });

// Ràng buộc: Mỗi đội bóng chỉ có 1 danh sách đội hình cho 1 trận đấu
matchLineupSchema.index({ matchId: 1, teamId: 1 }, { unique: true });

const MatchLineupModel = mongoose.model('MatchLineup', matchLineupSchema);

export default MatchLineupModel;