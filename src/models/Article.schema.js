// there i will make an articleSchema :

import mongoose from "mongoose";

const articleSchema = mongoose.Schema({
    title: {
        type: String,
        required: true

    },

    content: {
        type: String,
        required: true,
        default: ""
    },

    image: {
        type: String,

    },

    video: {
        type: String,
    },

    createdBy: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],


}, { timestamps: true })

articleSchema.index({ title :1 });
const Article = mongoose.model('Article', articleSchema);
export { Article }