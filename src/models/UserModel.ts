import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: [true, "Please provide first name"],
    },
    lastName:{
        type: String,
        required: [true, "Please provide last name"],
    },
    email:{
        type: String,
        required:[true, "Please provide email"],
        unique: true
    },
    password:{
        type:String,
        reuired: [true, "Please provide strong password"],
    },
    verifyToken: String,
    verifyTokenExpiry: Date,
})

const User = mongoose.models.users || mongoose.model("users", UserSchema);

export default User;