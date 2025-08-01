// importing mongoose
import mongoose from "mongoose";

// () => (connects to the database)
const connectDb = async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("connection successful to the database");
    } catch (error) {
        console.error(error.message);
    }
};

// exporting function
export default connectDb;