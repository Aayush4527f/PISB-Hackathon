// importing LIBRARIES
import dotenv from 'dotenv';
import jsonwebtoken from 'jsonwebtoken';

// importing UTILITIES
import { bcrypt_auth } from '../utils.js';

// read ENVIRONMENT variables
dotenv.config();

// importing mongoose MODELS
import User from "../models/user.model.js";

// controller for '/register'
export const registerUser = async (req, res, next)=>{
    // get username and password from input
    let input = req.body;

    if (!input.username || !input.password) {
        return res.status(400).json({ success: false, message: "enter username and password fields" });
    }

    try {
        
        const saved_user = await User.create({username:input.username,password:input.password,is_doc:input.is_doc});
        const token = jsonwebtoken.sign({id:saved_user._id},process.env.SECRET,{expiresIn:"1d"});
        return res.status(201).json({ success: true, token:token, message:"successful registration"});
    }
    catch (error) {
        next(error);
        
    }
}

// controller for '/login'
export const loginUser = async (req, res, next) => {
    // get the username and password from input
    let input = req.body;

    if (!input.username || !input.password) {
        return res.status(400).json({ success: false, message: "enter username and password fields" });
    }

    // authenticate user
    try {
        let authenticated_user = await bcrypt_auth(input.username,input.password);

        if(authenticated_user === null){
            return res.status(500).json({success:false,message:"internal server error"});
        }

        if (authenticated_user) {
            const token = jsonwebtoken.sign({id:authenticated_user._id},process.env.SECRET,{expiresIn:"1d"});
            return res.status(200).json({ success: true, message: "you are logged in", token:token }); // if password is correct log in
        }else return res.status(401).json({ success: false, message: "wrong username or password" }); // otherwise show wrong username/pass
    
    } catch (error) {
        next(error);
    }
};

// controller for '/changepass'
export const changePass = async (req, res, next) => {
    // get username, password and new_pass from input
    let input = req.body;

    if (!input.username || !input.password || !input.new_pass) {
        return res.status(400).json({ success: false, message: "enter username and password fields" });
    }

    // pass and new pass should not be same
    if(input.password == input.new_pass){
        return res.status(400).json({error:true,message:"new and old pass cant be same"})
    }

    // authenticate user
    try {
        let authenticated_user = await bcrypt_auth(input.username,input.password);
        
        if(authenticated_user === null){
            return res.status(500).json({success:false,message:"internal server error"});
        }

        if (authenticated_user) { // if authenticated change the password in the database
            authenticated_user.password = input.new_pass;
            await authenticated_user.save();
            return res.status(200).json({ success: true, message: "your password has been succesfully changed" });
        }
        return res.status(401).json({ success: false, message: "wrong username or password" });
    } catch (error) {
        next(error);
    }
};

// controller for '/delete'
export const deleteUser = async (req, res, next) => {
    // get username and password from input
    let input = req.body;

    if (!input.username || !input.password) {
        return res.status(400).json({ success: false, message: "enter username and password fields" });
    }

    try {
        // authenticate user
        let authenticated_user = await bcrypt_auth(input.username,input.password);
        if(authenticated_user === null){
            return res.status(500).json({success:false,message:"internal server error"});
        }
        if (authenticated_user) {
            await authenticated_user.deleteOne();
        
            return res.status(200).json({ success: true, message: "user successfully deleted" });
        }
        return res.status(401).json({ success: false, message: "wrong username or password" });
        
    } catch (error) {
        next(error);
    }

};