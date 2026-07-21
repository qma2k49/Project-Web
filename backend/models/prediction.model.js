import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true
    },
    predictedHomeScore: {
        type: Number
    },
    predictedAwayScore: {
        type: Number
    },
    x2Bonus: {
        type: Boolean,
        default: false
    },
    firstScorePlayer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    status: {
        type: String,
        enum: ['NOT STARTED', 'LIVE', 'FINISHED'],
        default: 'NOT STARTED'
    },
    pointsEarned: {
        type: Number,
        default: 0
    }
}, { timestamp: true });

const PredictionModel = mongoose.model('Prediction', predictionSchema);

export default PredictionModel;