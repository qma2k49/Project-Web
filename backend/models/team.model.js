import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
    __t: { type: String, default: 'NationalTeam' },
    name: { type: String, required: true },
    shortName: {
        type: String,
        required: true,
    },
    logo: { type: String },
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach' },
    foundedYear: { type: Number },
    stadium: { type: mongoose.Schema.Types.ObjectId, ref: 'Stadium' }
}, { timestamps: true });
const TeamModel = mongoose.model('Team', teamSchema);

const NationalTeamModel = TeamModel.discriminator('NationalTeam', new mongoose.Schema({
    country: { type: String }
}));

const ClubModel = TeamModel.discriminator('Club', new mongoose.Schema({
    confederation: { type: String }
}));

export {
    TeamModel,
    ClubModel,
    NationalTeamModel
};
export default TeamModel;