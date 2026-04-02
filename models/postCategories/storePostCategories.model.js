import mongoose from "mongoose";


const storePostCategoriesSchema = mongoose.Schema({
    name: {type: String, required: true},
    status: {type: String, enum: ['0','1'], default: '0'},
}, {
    timestamps: true
});

const storePostCategoriesModel = mongoose.model('storepostcategories',storePostCategoriesSchema);

export default storePostCategoriesModel;