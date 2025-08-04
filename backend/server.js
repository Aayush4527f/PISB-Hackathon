// importing npm modules/libraries
import express from "express";
import dotenv from "dotenv";
import cookieparser from "cookie-parser";


// to server static file we need __dirname thats not in es module so we have to manually define it
import path from 'path'
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ROUTES
import userRoutes from './routes/user.routes.js';
import scanRoutes from './routes/scan.routes.js';


// importing mongoose connection function to connect to database
import connectDb from "./config_db.js";

// importing the error handler
import errorHandler from "./middleware/errorHandler.js";

// to access environment variables
dotenv.config(); 

// port for listening requests through express
const PORT = process.env.PORT; 

const app = express();


// to access input in json format
app.use(express.json()); 
app.use(express.urlencoded({extended:true}));

// cookies
app.use(cookieparser());


// routes
app.use('/api/user',userRoutes);
app.use('/api/scan',scanRoutes);

// serving static files
app.use(express.static(path.join(__dirname, '../static'), { extensions: ['html'] }));

app.use(errorHandler);

// listen at PORT
app.listen(PORT, () => {
    // connect to the database
    connectDb();
    // log the start of server
    console.log(`server listening at port ${PORT}`);
});