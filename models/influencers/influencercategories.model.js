import mongoose from "mongoose";


const influencercategoriesSchema = mongoose.Schema({
    name: {type: String,required: true},
    status: {type: String,enum: ['0','1'],default: '0'},
}, {
    timestamps: true
})

const InfluencerCategoriesModel = mongoose.model('InfluencerCategories', influencercategoriesSchema);

export default InfluencerCategoriesModel;