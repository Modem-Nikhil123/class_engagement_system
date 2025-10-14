const mongoose = require('mongoose');
const schema=new mongoose.Schema(
    {
    userId:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    role:{
        type:String,
        required:true,
        enum: ['super_admin', 'hod', 'teacher', 'student']
    },
    originalId:{
        type:String,
        required:false // Only used for students and teachers to store original ID
    }
    },
    {timestamps:true}
)
const user = mongoose.model("users",schema);
module.exports=user;