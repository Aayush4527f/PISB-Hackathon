// importing mongoose
import mongoose from "mongoose";

const tempSchema = mongoose.Schema({
    Something:{
        type: String,
        required: true
    },

});

// mongoose model
const Temp = mongoose.model("temp",tempSchema);

// exporting model
export default Temp;