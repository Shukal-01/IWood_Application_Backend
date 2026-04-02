import mongoose from "mongoose";


const citySchema = mongoose.Schema({
    name: { type: String },
    code: { type: String, unique: true },
    stateCode: { type: String },
    countryCode: { type: String },
    status: { type: String },
})


const cityModel = mongoose.model('cities', citySchema)

export default cityModel;