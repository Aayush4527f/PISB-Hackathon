// importing libraries
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';

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

export const authenticate_token = async(token)=>{
    try {
        let verified = jsonwebtoken.verify(token,process.env.SECRET);
        if(verified){
            return {success:true,message:"authenticated",owner:verified.username};
        }else{
            return {success:false,message:"not authenticated"};
        }
    } catch (error) {
        console.error(error.message);
        return {success:false,message:"not authenticated"};
    }

};