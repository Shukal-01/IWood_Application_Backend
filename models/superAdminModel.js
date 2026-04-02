import mongoose from "mongoose";

const superAdminSchema = mongoose.Schema({
    name: { type: String },
    email: { type: String },
    password: { type: String },
    employeeId: { type: String },
    mobileNumber: { type: Number },
    designation: { type: String },
    role: { type: Array },
    created: { type: Date },
    updated: { type: Date },
});

const superAdminModel = mongoose.model("superadmin", superAdminSchema);

export default superAdminModel;