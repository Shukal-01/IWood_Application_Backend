import mongoose from "mongoose";

const influencersubcategoriesSchema = mongoose.Schema({
    name: { type: String, required: true },
    categoryId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'InfluencerCategories',
        required: true 
    },
    status: { type: String, enum: ['0','1'], default: '0' },
}, {
    timestamps: true
});

const InfluencerSubCategoriesModel = mongoose.model('InfluencerSubCategories', influencersubcategoriesSchema);

export default InfluencerSubCategoriesModel; 