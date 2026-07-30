import mongoose from "mongoose";

const knockoutStageSchema = new mongoose.Schema({
    tournamentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tournament', 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    }, // e.g., "Vòng 1/8", "Tứ kết", "Bán kết", "Chung kết"
    order: { 
        type: Number, 
        required: true 
    }, // Sorting order, e.g. 1, 2, 3, 4
    hasLeg2: { 
        type: Boolean, 
        default: false 
    }, // true if has both Leg 1 (lượt đi) and Leg 2 (lượt về)
    hasThirdPlace: { 
        type: Boolean, 
        default: false 
    } // true if there is a 3rd place match
}, { timestamps: true });

const KnockoutStageModel = mongoose.model('KnockoutStage', knockoutStageSchema);

export default KnockoutStageModel;
