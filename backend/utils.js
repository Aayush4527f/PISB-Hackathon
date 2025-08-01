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
        const match_user = await find_docs({username: username},User);
        if (match_user[0] && await bcrypt.compare(password, match_user[0].password)) {
            return match_user[0];
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

// (username,password, new_pass) => (check if given fields are valid then return {error:false}, if not return {error:true,message})
export const validateUser = async(input,required_fields,validate_pass)=>{
    
    // checking if all fields are inputted
    for (let field of required_fields){
        if(input[field] === null || input[field] === undefined || input[field] === ""){
            return {error:true,message:`enter ${field} field`};
        }
    }
    // check if old and new pass are same
    if(required_fields.includes("new_pass") && input.password == input.new_pass){
        return {error:true,message:"new and old pass cant be same"}
    }

    if(input[validate_pass]){
        if(input[validate_pass].length < 8){
            return {error:true,message:"password must be atleast 8 characters"};
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
        if (!passwordRegex.test(input[validate_pass])) {
            return {error: true,message: "Password must include uppercase, lowercase, number, and special character"};
        }
    }
    return {error:false}
}