import mongoose from "mongoose";


const countrySchema = mongoose.Schema({
    name: { type: String },
    code: { type: String, unique: true },
    status: { type: String },
})

const countryModel = mongoose.model('countries', countrySchema)

export default countryModel