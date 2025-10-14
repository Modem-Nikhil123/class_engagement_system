const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const studentModel = require('../models/students');

const createToken=(userId,res)=>{
    const token=jwt.sign({userId},process.env.SECRET_KEY,{
        // expiresIn:'7d'
    })
    res.cookie('jwt',token,{
        httpOnly:true,
        sameSite:'Lax',
        secure:false,
        maxAge:7*24*60*60*1000
    })
}

const authenticateToken = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(400).json({ message: "unauthorized-token not found" });
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (!decoded) {
            return res.status(400).json({ message: "unauthorized-token not found" });
        }
        let user = await userModel.findById(decoded.userId).select('-password').lean();
        if (!user) {
            return res.status(400).json({ message: "user not found" });
        }
        if (user.role == 'student') {
            let student = null;

            // Try originalId first (for new users)
            if (user.originalId) {
                student = await studentModel.findOne({ studentId: user.originalId });
            }

            // Fallback for existing users: try uppercase version of userId
            if (!student) {
                const upperCaseId = user.userId.toUpperCase();
                student = await studentModel.findOne({ studentId: upperCaseId });
            }

            if (student) {
                user.section = student.section;
            }
        }
        req.user = user;
        next();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "internal server error" });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (Array.isArray(roles)) {
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ message: "Access denied. Insufficient permissions." });
            }
        } else {
            if (req.user.role !== roles) {
                return res.status(403).json({ message: "Access denied. Insufficient permissions." });
            }
        }
        next();
    };
};

module.exports = { createToken, authenticateToken, requireRole };