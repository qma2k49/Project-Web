import mongoose from "mongoose";

const predictionLeaderboardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    exactMatches: {
        type: Number,
        default: 0
    },
    correctResults: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

predictionLeaderboardSchema.index({ userId: 1, tournamentId: 1 }, { unique: true });
predictionLeaderboardSchema.index({ tournamentId: 1, totalPoints: -1, exactMatches: -1 });

const PredictionLeaderboardModel = mongoose.model('PredictionLeaderboard', predictionLeaderboardSchema);
export default PredictionLeaderboardModel;