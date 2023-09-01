const User = require('../models/UserModel')
const bcrypt = require('bcrypt')
const { createToken } = require('../middlewares/auth')


exports.register = async (req, res) => {
    try {

        const { name, email, password, avatar, skills, resume } = req.body;

        // I will add cloudinary later

        const hashPass = await bcrypt.hash(password,10)
        const user = await User.create({
            name,
            email,
            password:hashPass,
            avatar,
            skills,
            resume
        })      

        const token = createToken(user._id,user.email)

        res.status(201).json({
            success: true,
            message: "User Created",
            user,
            token
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


exports.login = async (req,res) => {
    try{
        const { email, password } = req.body ;

        const user = await User.findOne({email}) ;

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User does not exists"
            })
        }

        const isMatch = await bcrypt.compare(password,user.password) ;

        if(!isMatch){
            return res.status(401).json({
                success: false,
                message: "Wrong Password"
            })
        }   

        const token = createToken(user._id,user.email)

        res.status(200).json({
            success: true,
            message: "User logged In Successfully",
            token
        })

        

    }catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


exports.isLogin = async (req,res) => {
    try{

        const user = await User.findById(req.user._id) ;

        if(user){
            return res.status(200).json({
                success: true,
                isLogin: true
            })
        }else{
            return res.status(200).json({
                success: true,
                isLogin: false
            })
        }

    }catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

exports.me = async (req, res) => {
    try{
        const user = await User.findById(req.user._id) ;

        res.status(200).json({
            success: true,
            user
        })

    }catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

exports.changePassword = async (req,res) => {
    try{
        
        const { oldPassword, newPassword, confirmPassword } = req.body ;
        
        const user = await User.findById(req.user._id) 

        const userPassword = user.password ;

        const isMatch = await bcrypt.compare(oldPassword, userPassword) ;

        if(!isMatch){
            return res.status(401).json({
                success: false,
                message: "Old password is wrong"
            })
        }

        if(newPassword === oldPassword){
            return res.status(400).json({
                success: false,
                message: "New password is same as old Password"
            })
        }

        if(newPassword !== confirmPassword){
            return res.status(401).json({
                success: false,
                message: "New Pasword and Confirm Password are not matching"
            })
        }

        const hashPass = await bcrypt.hash(newPassword, 10) ;

        user.password = hashPass ;

        await user.save() ;

        res.status(200).json({
            success: true,
            message: "User password changed"
        })

        

    }catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

exports.updateProfile = async (req,res) => {
    try{
        const { newName, newEmail, newSkills } = req.body ; 

        const user = await User.findById(req.user._id) ;

        // I will add update avtar from cloudinary later 

        user.name = newName 
        user.email = newEmail
        user.skills = newSkills

        await user.save()

        res.status(200).json({
            success: true,
            message: "Profile Updated"
        })
        

    }catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}