import mongoose from "mongoose";


const productionHousePostCategoriesSchema = mongoose.Schema({
    name: {type: String, required: true},
    status: {type: String, enum: ['0','1'], default: '0'},
}, {
    timestamps: true
});

const productionHousePostCategoriesModel = mongoose.model('productionHousepostcategories',productionHousePostCategoriesSchema);

export default productionHousePostCategoriesModel;