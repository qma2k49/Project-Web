import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
    tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    round: { type: Number, required: true },

    homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },

    refereeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },

    homeScore: { type: Number, default: 0 },
    awayScore: { type: Number, default: 0 },

    matchTime: { type: Date, required: true },
    status: {
        type: String,
        enum: ['NOT STARTED', 'LIVE', 'FINISHED'],
        default: 'NOT STARTED'
    },
    stadium: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stadium'
    },
    matchDetails: {
        // gợi ý gì đi???

    }
}, { timestamps: true });

const MatchModel = mongoose.model('Match', matchSchema);

export default MatchModel;