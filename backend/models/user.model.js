// importing mongoose
import mongoose from "mongoose";

// userschema => (username,password both required)
const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "username is required"],
        unique: [true, "username already taken"]
    },
    password: {
        type: String,
        required: true
    },
    is_doc: {
        type: Boolean,
        default: false
    }
});

// mongoose model
const User = mongoose.model("User", UserSchema);

// exporting model
export default User;