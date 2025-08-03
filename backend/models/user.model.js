// importing mongoose
import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// userschema => (username,password both required)
const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "username is required"],
        unique: [true, "username already taken"]
    },
    password: {
        type: String,
        required: true,
    },
    is_doc: {
        type: Boolean,
        default: false
    }
});

UserSchema.pre('save', async function() {
    // 'this' refers to the document being saved
    
    // Only validate and hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return; // Exit the function if the password hasn't changed
    }
    
    // --- 1. VALIDATE THE PLAIN-TEXT PASSWORD ---
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
    if (this.password.length < 8 || !passwordRegex.test(this.password)) {
        // Throwing an error here will prevent the save operation
        // and be caught by the .catch() block in your controller.
        const validationError = new Error('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
        validationError.name = 'ValidationError';
        throw validationError;
    }

    // --- 2. HASH THE PASSWORD ---
    // This part only runs if the validation above passes.
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
});

// mongoose model
const User = mongoose.model("User", UserSchema);

// exporting model
export default User;