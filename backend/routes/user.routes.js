// importing express
import express from 'express'

// importing controllers
import {registerUser,loginUser, deleteUser,get_role, get_doctors} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';

// initialize "router"
const router = express.Router();

// REGISTER USER
router.post("/register", registerUser);

// LOGIN USER
router.post("/login",loginUser);


// DELETE USER
router.post("/delete",deleteUser);

// GET ROLE
router.post("/role",protect,get_role);

// GET DOCTORS
router.post("/get_doctors",protect,get_doctors)

// export router
export default router;