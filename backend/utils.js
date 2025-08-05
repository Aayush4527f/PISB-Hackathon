// importing libraries
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import cloudinary from './config/cloudinary.js'; // Import your configured Cloudinary instance
import streamifier from 'streamifier';
import axios from 'axios';
import FormData from 'form-data';

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


export const uploadToCloudinary = (imageBuffer, folderName) => {
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


export const getMLPrediction = async (imageBuffer, originalFilename) => {
    // URL of your running Python Flask server
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:5000/predict';

    const formData = new FormData();
    // The Python server expects a field named 'file'
    formData.append('file', imageBuffer, { filename: originalFilename });

    try {
        console.log('Forwarding image to Python ML service...');
        const response = await axios.post(pythonApiUrl, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        console.log('Received prediction:', response.data);
        return response.data; // e.g., { prediction: 'Pneumonia', confidence: 0.98 }
    } catch (error) {
        console.error("Error calling Python ML service:", error.message);
        // Throw an error so the main controller can handle it
        throw new Error('Could not get a diagnosis from the ML model.');
    }
};
