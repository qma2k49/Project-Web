import mongoose from "mongoose";

const stadiumSchema = new mongoose.Schema({
    name: { type: String, required: true },
    capacity: { type: Number },
    builtYear: { type: Number },
    city: {
        type: String,
    },
    country: {
        type: String,
    },
    image: { type: String }
}, { timestamps: true });

const StadiumModel = mongoose.model('Stadium', stadiumSchema);

export default StadiumModel;