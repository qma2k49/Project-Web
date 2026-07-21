import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    season: { type: String, required: true },
    type: {
        type: String,
        enum: ['LEAGUE', 'CUP']
    },
    status: {
        type: String,
        enum: ['PENDING', 'ONGOING', 'COMPLETED'],
        default: 'PENDING'
    },
    startDate: { type: Date },
    endDate: { type: Date },
}, { timestamps: true });

const TournamentModel = mongoose.model('Tournament', tournamentSchema);

const LeagueTournamentModel = TournamentModel.discriminator('LEAGUE', new mongoose.Schema({
}));

const CupTournamentModel = TournamentModel.discriminator('CUP', new mongoose.Schema({
    groups: [{
        name: { type: String, required: true },
        teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }]
    }],

    knockoutStages: [{
        name: { type: String, required: true }
    }]
}));

export { TournamentModel, LeagueTournamentModel, CupTournamentModel };
export default TournamentModel;