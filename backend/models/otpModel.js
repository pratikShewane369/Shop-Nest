const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
    email : {
        type : String,
        require : true,
    }, 
    otp : {
        type : String,
        require : true,
    },
    createdAt : {
        type : Date,
        default : Date.now,
        expires : 300 // OTP Expires in 5 Minutes
    }
})

module.exports = mongoose.model("OTP", otpSchema);