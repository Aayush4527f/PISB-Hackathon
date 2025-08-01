// importing LIBRARIES
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jsonwebtoken from 'jsonwebtoken';

// importing UTILITIES
import { find_docs, bcrypt_auth, validateUser } from '../utils.js';

// read ENVIRONMENT variables
dotenv.config();

// SALT FOR HASHING
const salt = Number(process.env.SALT);
// console.log(salt)

// importing mongoose MODELS
import User from "../models/user.model.js";


// controller for '/' (to get all users)
// () => (all saved users)
export const getUsers = async(req,res)=>{
    // get all users saved
    try {
        let users = await find_docs({},User);
        if(users === null){
            return res.status(500).json({success:false,message:"internal server error"});
        }
        if(users.length === 0){
            return res.status(404).json({success:false,message:"no users found"});
        }
        // return saved "users"
        return res.status(200).json({success:true,users:users});
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({success:false,message:"something went wrong"});
    }
};

// controller for '/register'
// (username, password) => (if username is not taken then register user and return saved user, else return the error)
export const registerUser = async (req,res)=>{
    // get username and password from input
    let input = req.body;

    // validate input
    let validation = await validateUser(input,["username","password"],"password");
    if(validation.error){
        return res.status(400).json({success:false,message:validation.message});
    }

    try {
        
        input.password = await bcrypt.hash(input.password, salt); //HASHING PASSWORD
        const saved_user = await User.create({username:input.username,password:input.password,is_doc:input.is_doc});
        const token = jsonwebtoken.sign({username:input.username,is_doc:input.is_doc},process.env.SECRET);
        return res.status(201).json({ success: true, token:token });
    }
    catch (error) {
        if(error.cause.code == 11000){ // username already exists
            console.log("motherfucker")
            return res.status(409).json({ success: false, message: "user already exists" });
        }

        console.error(error);
        return res.status(500).json({ success: false, message: "something went wrong" });
        
    }
}

// controller for '/login'
// (username, password) => (if authenticated return "true", else "false")
export const loginUser = async (req, res) => {
    // get the username and password from input
    let input = req.body;

    // validate input
    let validation = await validateUser(input,["username","password"],"password");
    if(validation.error){
        return res.status(400).json({success:false,message:validation.message});
    }

    // authenticate user
    try {
        let authenticated_user = await bcrypt_auth(input.username,input.password);

        if(authenticated_user === null){
            return res.status(500).json({success:false,message:"internal server error"});
        }

        if (authenticated_user) {
            const token = jsonwebtoken.sign({username:authenticated_user.username,is_doc:authenticated_user.is_doc},process.env.SECRET);
            return res.status(200).json({ success: true, message: "you are logged in", token:token }); // if password is correct log in
        }else return res.status(401).json({ success: false, message: "wrong username or password" }); // otherwise show wrong username/pass
    
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({success:false,message:"something went wrong"});
    }
};

// controller for '/changepass'
// (username, password, new_pass) => (if authenticated update password and return "true", else return "false")
export const changePass = async (req, res) => {
    // get username, password and new_pass from input
    let input = req.body;

    // validate input
    let validation = await validateUser(input,["username","password","new_pass"],"new_pass");
    if(validation.error){
        return res.status(400).json({success:false,message:validation.message});
    }

    // authenticate user
    try {
        let authenticated_user = await bcrypt_auth(input.username,input.password);
        
        if(authenticated_user === null){
            return res.status(500).json({success:false,message:"internal server error"});
        }

        if (authenticated_user) { // if authenticated change the password in the database
            authenticated_user.password = await bcrypt.hash(input.new_pass, salt);
            await authenticated_user.save();
            return res.status(200).json({ success: true, message: "your password has been succesfully changed" });
        }
        return res.status(401).json({ success: false, message: "wrong username or password" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({success:false,message:"something went wrong"});
    }
};

// controller for '/delete'
export const deleteUser = async (req, res) => {
    // get username and password from input
    let input = req.body;

    // validate input
    let validation = await validateUser(input,["username","password"]);
    if(validation.error){
        return res.status(400).json({success:false,message:validation.message});
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
        console.error(error.message);
        return res.status(500).json({success:false,message:"something went wrong"});
    }

};