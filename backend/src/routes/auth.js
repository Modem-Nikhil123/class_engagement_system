const express = require('express');
const {login,logout,protectRoute,checkAuth,changePassword} =require('../controllers/auth');
const router=express.Router();

router.post('/login',login)
router.get('/logout',logout)
router.get('/check',protectRoute,checkAuth)
router.post('/change-password',protectRoute,changePassword)
module.exports=router;