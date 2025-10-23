const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const cors=require('cors');
const  authRoutes= require('./routes/auth.js');
const classRoutes=require('./routes/class.js');
const reminderRoutes=require('./routes/reminders.js');
const substituteRoutes=require('./routes/substituteRoutes.js');
const teacherRoutes=require('./routes/teacherRoutes.js');
const adminRoutes=require('./routes/adminRoutes.js');
dotenv.config();
const app=express();
app.use(express.json());
app.use(cookieParser());  
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials:true,
}));
mongoose.connect(process.env.MONGODB_URL)
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

app.use('/auth',authRoutes);
app.use('/class',classRoutes);
app.use('/reminders',reminderRoutes);
app.use('/substitute',substituteRoutes);
app.use('/teachers',teacherRoutes);
app.use('/admin',adminRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})