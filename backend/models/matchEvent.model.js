import mongoose from "mongoose";

const matchEventSchema = new mongoose.Schema({
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
    outgoingPlayerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
    incomingPlayerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },

    minute: { type: Number, required: true },
    stoppageMinute: { type: Number, default: 0 },
    eventType: {
        type: String,
        enum: ['Goal', 'YellowCard', 'RedCard', 'Substitution', 'OwnGoal', 'StartHalf'],
        required: true
    },
    note: { type: String }
}, { timestamps: true });

const MatchEventModel = mongoose.model('MatchEvent', matchEventSchema);
export default MatchEventModel;