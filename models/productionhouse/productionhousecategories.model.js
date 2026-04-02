import mongoose from "mongoose";

const productionhousecategoriesSchema = mongoose.Schema({
    name: {type: String, required: true},
    status: {type: String, enum: ['0','1'], default: '0'},
}, {
    timestamps: true
});

const ProductionHouseCategories = mongoose.model('ProductionHouseCategories', productionhousecategoriesSchema);

export default ProductionHouseCategories; 