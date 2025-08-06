// importing express
import express from 'express'

// importing controllers
import { updateNote, uploadScan, dashboard, deleteScan } from '../controllers/scan.controller.js';

// importing middleware
import { protect, isDoctor } from "../middleware/auth.js";
import upload from '../middleware/upload.js';

// initialize "router"
const router = express.Router();

// upload scan and get results
router.post("/", protect, upload.single("scanImage") ,uploadScan);

// dashboard
router.post("/dashboard", protect, isDoctor, dashboard);

// update notes
router.post("/updateNote",protect, isDoctor, updateNote);

// delete scan
router.post("/delete",protect, isDoctor, deleteScan);


// export router
export default router;