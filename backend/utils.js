// importing libraries
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import cloudinary from './config/cloudinary.js'; // Import your configured Cloudinary instance
import streamifier from 'streamifier';

dotenv.config();

// importing mongoose models
import User from './models/user.model.js';

// (username,password) => (if password is correct return the user, else return false)
export const bcrypt_auth = async(username,password)=>{
    try {
        const match_user = await User.findOne({username: username});
        if (match_user && await bcrypt.compare(password, match_user.password)) {
            return match_user;
        }
        else {
            return false;
        }
    } catch (error) {
        console.error(error.message);
        return null;
    }
};


const uploadToCloudinary = (imageBuffer, folderName) => {
    // Wrap the upload logic in a Promise
    return new Promise((resolve, reject) => {

        // 1. Create an upload stream from Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folderName,
            },
            (error, result) => {
                if (error) {
                    // If there was an error, reject the promise
                    reject(error);
                } else {
                    // If successful, resolve the promise with the secure URL
                    resolve(result.secure_url);
                }
            }
        );
        // 2. Pipe the image buffer into the upload stream
        streamifier.createReadStream(imageBuffer).pipe(uploadStream);
    });
};

export default uploadToCloudinary;
