const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');
const crypto = require('crypto')

const userSchema=mongoose.Schema({
    name:{
        type: String,
        required: [true,'Please enter your name'],
        maxlength:[30,'Your name must be at least 30 characters']
    },
    email:{
        type: String,
        required: [true,'Please enter your email address'],
        unique: true,
        validate: [validator.isEmail,'Please enter a valid email address']
    },
    password:{
        type: String,
        required: [true,'Please enter your password'],
        minlength:[6,"Your password must be at least 6 characters"],
        select:false,
    },
    avatar:{
        public_id:{
            type: String,
            required:true
        },
        url:{
            type: String,
            required:true
        }
    },
    role:{
        type: String,
        default: 'user'
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    resetPasswordToken:String,
    resetPasswordExpires:Date,
})

userSchema.pre('save',async function(next) {
    if(!this.isModified('password')){
        next()
    }
    this.password=await bcrypt.hash(this.password,10)
})

userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password)
}

userSchema.methods.getJwtToken= function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRECT,{
        expiresIn:process.env.JWTEXPIRETIME
    })
}

userSchema.methods.getResetPasswordToken = function(){

    const resetToken =crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpires=Date.now()+30*60*1000

    return resetToken;
}

module.exports =mongoose.model('User',userSchema)