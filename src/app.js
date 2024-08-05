// app.js
import express from 'express' 
import dotenv from 'dotenv' 
import cors from 'cors'
import userRouter from './routes/userroute.js'
import adminRouter from './routes/adminroute.js'
dotenv.config() 

const app = express(); 
const corsOptions = {
    origin: ["http://localhost:3000"],
    methods: ['GET', 'POST', 'UPDATE'],// Frontend domain
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow credentials (cookies) to be sent
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/user', userRouter)
app.use('/api/admin',adminRouter)

export default app;