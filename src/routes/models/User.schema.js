// there i will make an userSchema :
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
const userSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        index: true
    }, email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    avatar: {
        type: String    
    },
    coverImage: {
        type: String
    },

    refreshToken: {
        type: String
    },

    about: {
        type: String,
        default: ""
    },

}, { timestamps: true })
/** @type {import('./User.schema.js').User} */



userSchema.methods.genrateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY })

}


userSchema.methods.genrateRefreshToken = function () {

    return jwt.sign({
        _id: this._id
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY })
}




const User = mongoose.model('User', userSchema);
export { User }