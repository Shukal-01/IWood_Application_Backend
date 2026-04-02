import mongoose from "mongoose";


const eventCompanyPostCategoriesSchema = mongoose.Schema({
    name: {type: String, required: true},
    status: {type: String, enum: ['0','1'], default: '0'},
}, {
    timestamps: true
});

const eventCompanyPostCategoriesModel = mongoose.model('eventCompanypostcategories',eventCompanyPostCategoriesSchema);

export default eventCompanyPostCategoriesModel;