// importing mongoose
import mongoose from "mongoose";

// userschema => (username,password both required)
const scanSchema = mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    patient_id:{
        type: String,
        required: true,
        unique: true
    },
    is_pneumonia:{
        type: Boolean,
        required: true
    },
    url:{
        type: String,
        required: true,
    },
    note:{
        type: String,
        trim: true,
        default: ""
    }},
{
    timestamps: true
});

// mongoose model
const Scan = mongoose.model("Scan", scanSchema);

// exporting model
export default Scan;