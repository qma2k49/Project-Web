import mongoose from "mongoose";

const matchEventSchema = new mongoose.Schema({
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },

    minute: { type: Number, required: true },
    eventType: {
        type: String,
        enum: ['Goal', 'YellowCard', 'RedCard', 'Substitution', 'OwnGoal'],
        required: true
    },
    note: { type: String }
}, { timestamps: true });

const MatchEventModel = mongoose.model('MatchEvent', matchEventSchema);
export default MatchEventModel;