// importing express
import express from 'express'

// importing controllers
import {registerUser,loginUser, changePass, deleteUser} from '../controllers/user.controller.js';

// initialize "router"
const router = express.Router();

// REGISTER USER
router.post("/register", registerUser);

// LOGIN USER
router.post("/login",loginUser);

// CHANGE PASSWORD
router.post("/changepass",changePass);

// DELETE USER
router.post("/delete",deleteUser);

// export router
export default router;