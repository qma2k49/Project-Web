import mongoose from "mongoose";

const roundNameTournementSchema = new mongoose.Schema({
    tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    roundName: { type: String, required: true },
}, { timestamps: true });

const RoundNameTournementModel = mongoose.model('RoundNameTournement', roundNameTournementSchema);

export default RoundNameTournementModel;