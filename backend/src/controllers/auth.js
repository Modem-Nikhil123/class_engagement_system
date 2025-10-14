const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const userModel=require('../models/user.js')
const studentModel=require('../models/students.js')
const {createToken}=require('../lib/token.js') 

const login=async(req,res)=>{
    try{ 
    const {email,password}=req.body;
    if(!email || !password)
    {
        console.log("all fields are required");
        return res.status(400).json({message:"all fields are required"});
    }
    let user=await userModel.findOne({email}).lean();
    if(!user)
    {
        console.log("email not found");
        return res.status(400).json({message:"email not found"});
    }
    const match=await bcrypt.compare(password,user.password);
    if(match)
    {
        console.log("login successfull");
        if(user.role=='student')
        {
            let student = null;
    
            // Try originalId first (for new users)
            if (user.originalId) {
                student = await studentModel.findOne({studentId: user.originalId});
            }
    
            // Fallback for existing users: try uppercase version of userId
            if (!student) {
                const upperCaseId = user.userId.toUpperCase();
                student = await studentModel.findOne({studentId: upperCaseId});
            }
    
            if(student) {
                user.section = student.section;
            }
        }
        console.log(user);
        createToken(user._id,res);
        return res.status(201).json(user);
    }
    else
    {
        console.log("incorrect password");
        return res.status(400).json({message:"incorrect password"});
    }
    }
    catch(err){
    console.log(err)
    res.status(500).json({message:"Internal server error"});
    }
}
 
const logout=async(req,res)=>{
    try{
        res.clearCookie('jwt');
        res.status(201).json({message:"logged out successfully"})
    }
    catch(err){
        res.status(500).json({message:"internal error"});
    }
}

const protectRoute=async(req,res,next)=>{
    try{
    const token=req.cookies.jwt;
    if(!token)
    {
       return res.status(400).json({message:"unauthorized-token not found"})
    }
    const decoded=jwt.verify(token,process.env.SECRET_KEY);
    if(!decoded)
        return res.status(400).json({message:"unauthorized-token not found"})
    let user=await userModel.findById(decoded.userId).select('-password').lean();
    if(!user)
       return res.status(400).json({message:"user not found"});
    if(user.role=='student')
    {
        let student = null;

        // Try originalId first (for new users)
        if (user.originalId) {
            student = await studentModel.findOne({studentId: user.originalId});
        }

        // Fallback for existing users: try uppercase version of userId
        if (!student) {
            const upperCaseId = user.userId.toUpperCase();
            student = await studentModel.findOne({studentId: upperCaseId});
        }

        if(student) {
            user.section = student.section;
        }
    }
    req.user=user;
    next();
    }
    catch(err)
    {
        console.log(err);
       return res.status(500).json({message:"internal server error"})
    }
}

const checkAuth=async (req,res)=>{
    try{
    res.status(201).json(req.user);
    }
    catch(err){
        console.log(err)
        res.status(500).json({message:"internal server error"});
    }
}

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current password and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long" });
        }

        // Find the user
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await userModel.findByIdAndUpdate(userId, { password: hashedNewPassword });

        res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports={login,logout,checkAuth,protectRoute,changePassword};
