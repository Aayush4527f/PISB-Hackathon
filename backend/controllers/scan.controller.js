// importing LIBRARIES
import dotenv from 'dotenv';
import cloudinary  from '../config/cloudinary.js';
// read ENVIRONMENT variables
dotenv.config();

// importing mongoose MODELS
import Scan from "../models/scan.model.js";

import {uploadToCloudinary, getMLPrediction} from '../utils.js';

// controller for getting results
export const uploadScan = async (req, res, next) => {
    try {
        // if no req.file then return no image uploaded
        if (!req.file || !req.body.patient_id) {
            return res.status(400).json({ success: false, message: "missing parameters" });
        }
        // get the diagnosis from ml model (pass req.file.buffer)
        // let py = { diagnosis: false, summary: "normal" }; // TEMPORARY
        const mlResult = await getMLPrediction(req.file.buffer, req.file.originalname);

        const diagnosis = mlResult.prediction === 'Pneumonia'; // true if 'Pneumonia', else false
        const summary = `Prediction: ${mlResult.prediction} (Confidence: ${(mlResult.confidence * 100).toFixed(2)}%)`;


        // if req.user.is_doc then save image to cloudinary and save the results
        if (req.user.is_doc) {
            // save image to cloudinary
            const saved_url = await uploadToCloudinary(req.file.buffer, 'xray-scans');

            // save scan 
            await Scan.create({ doctor: req.user.id, patient_id: req.body.patient_id, url: saved_url, is_pneumonia: diagnosis, summary:summary, note:req.body.note });
        }
        // return the output from python child process
        return res.status(200).json({ success: true, summary: summary, diagnosis: diagnosis });
    }
    catch (error) {
        next(error);
    }
}

export const deleteScan = async(req, res, next) => {
    try {
        if(!req.body.scan_id){
            return res.status(400).json({ success: false, message: "missing parameters" });
        }
        const saved_scan = await Scan.findOne({_id:req.body.scan_id});

        if(saved_scan == null){
            return res.status(404).json({ success: false, message: "scan not found" });
        }else if(saved_scan.doctor.toString() !== req.user.id){
            return res.status(403).json({success:true, message:"Unauthorized"});
        }


        const publicId = saved_scan.url.split('/').slice(-2).join('/').split('.')[0];
        
        if (!publicId) {
            return res.status(400).json({ success: false, message: 'Could not parse image ID from URL.' });
        }
        // Delete the image from Cloudinary
        await cloudinary.uploader.destroy(publicId);


        // delete that scan
        await saved_scan.deleteOne();
        return res.status(200).json({ success: true, message: "scan successfully deleted" });


    } catch (error) {
        next(error);
    }
}

// controller to get the dashboard
export const dashboard = async (req, res, next) => {
    try {
        // get all the scans for the doctor
        let all_scans = await Scan.find({ doctor: req.user.id });
        // return the scans
        return res.status(200).json({ success: true, message: "successful", scans: all_scans });
    } catch (error) {
        next(error);
    }
}

// controller to change notes inside the dashboard
export const updateNote = async (req, res, next) => {
    try {
        // find scan by its _id
        if (!req.body.scan_id || !req.body.note) {
            return res.status(400).json({ success: false, message: "missing parameters" });
        }

        // update the scan
        const updated_scan = await Scan.findOneAndUpdate({ _id: req.body.scan_id, doctor: req.user.id }, { note: req.body.note });
        if (updated_scan == null) {
            return res.status(404).json({ success: false, message: "scan not found" });
        }
        return res.status(200).json({ success: true, message: "successful update" });
    } catch (error) {
        next(error);
    }
}