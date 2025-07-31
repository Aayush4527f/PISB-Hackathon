// import libraries

// importing models
import Temp from '../models/temp.model.js';

// to server static file we need __dirname thats not in es module so we have to manually define it
import path from 'path'
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const serveFile = (file_address) => async(req,res)=>{
    return res.sendFile(path.join(__dirname,'../../static',file_address));
}
