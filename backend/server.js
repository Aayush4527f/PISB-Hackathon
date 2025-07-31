// importing npm modules/libraries
import express from "express";
import dotenv from "dotenv";

// to server static file we need __dirname thats not in es module so we have to manually define it
import path from 'path'
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ROUTES
import mainRoutes from './routes/main.routes.js';

// importing mongoose connection function to connect to database
import connectDb from "./config_db.js";

// to access environment variables
dotenv.config(); 

// port for listening requests through express
const PORT = process.env.PORT; 

const app = express();


// to access input in json format
app.use(express.json()); 
app.use(express.urlencoded({extended:true}));

// main routes
app.use('/',mainRoutes);

// serving static files
app.use(express.static(path.join(__dirname, '../static'), { extensions: ['html'] }));

// listen at PORT
app.listen(PORT, () => {
    // connect to the database
    connectDb();
    // log the start of server
    console.log(`server listening at port ${PORT}`);
});