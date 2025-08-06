import jsonwebtoken from 'jsonwebtoken';
import User from '../models/user.model.js';

// Middleware to protect routes
export const protect = async (req, res, next) => {
    let token;

    if ( req.cookies.token ) {
        try {
            token = req.cookies.token;

            // Verify token
            const decoded = jsonwebtoken.verify(token, process.env.SECRET);

            // Get user from the token and attach it to the request object
            req.user = await User.findById(decoded.id).select('-password'); // Exclude password

            next();
        } catch (error) {
            console.error(error.message);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }
    
    if (!token) {
        return res.redirect("/login");
        // return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

// Middleware to check if the user is a doctor
export const isDoctor = (req, res, next) => {
    if (req.user && req.user.is_doc) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'User is not a doctor' }); // 403 Forbidden
    }
};