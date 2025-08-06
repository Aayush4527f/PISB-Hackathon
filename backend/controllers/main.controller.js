import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const serveFile = (file_address) => async(req,res,next)=>{
    try {
        return res.sendFile(path.join(__dirname,'../../static',file_address));
    } catch (error) {
        next(error);
    }
}