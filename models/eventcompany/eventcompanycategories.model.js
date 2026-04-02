import mongoose from "mongoose";

const eventcompanycategoriesSchema = mongoose.Schema({
    name: {type: String, required: true},
    status: {type: String, enum: ['0','1'], default: '0'},
}, {
    timestamps: true
});

const EventCompanyCategories = mongoose.model('EventCompanyCategories', eventcompanycategoriesSchema);

export default EventCompanyCategories; 