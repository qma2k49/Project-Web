import mongoose from "mongoose";

const baseOptions = {
    discriminatorKey: 'kind',
    collection: 'persons',
    timestamps: true
};

const personSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dateOfBirth: { type: Date },
    nationality: { type: String },
    avatar: { type: String }
}, baseOptions);

const PersonModel = mongoose.model('Person', personSchema);

const PlayerModel = PersonModel.discriminator('Player', new mongoose.Schema({
    position: { type: String, enum: ['GK', 'DF', 'MF', 'FW'] },
    jerseyNumber: { type: Number },
    currentTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    isCaptain: { type: Boolean, default: false },
    height: { type: String },
    weight: { type: String },
    preferredFoot: { type: String, enum: ['Right', 'Left', 'Both'] },
    status: {
        type: String,
        enum: ['ACTIVE', 'INJURED', 'SUSPENDED'],
        default: 'ACTIVE'
    }
}));

const CoachModel = PersonModel.discriminator('Coach', new mongoose.Schema({
    careerSummary: { type: String },
    currentTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
}));

const RefereeModel = PersonModel.discriminator('Referee', new mongoose.Schema({
    currentMatches: { type: [mongoose.Schema.Types.ObjectId], ref: 'Match' },
    yearsOfExperience: { type: Number }
}));

export { PersonModel, PlayerModel, CoachModel, RefereeModel };
export default PersonModel;