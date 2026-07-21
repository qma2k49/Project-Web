import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['ADMIN', 'USER'],
        default: 'USER'
    }
}, { timestamps: true })

const AccountModel = mongoose.model('Account', accountSchema);

export default AccountModel;