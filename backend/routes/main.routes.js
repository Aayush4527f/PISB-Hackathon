// importing express
import express from 'express'

// importing controllers
import { serveFile } from '../controllers/main.controller.js';

// importing middleware
import { protect, isDoctor } from "../middleware/auth.js";

// initialize "router"
const router = express.Router();

router.get("/dashboard",protect,isDoctor,serveFile("dashboard.html"));
router.get("/",protect,serveFile("scan.html"));

// export router
export default router;