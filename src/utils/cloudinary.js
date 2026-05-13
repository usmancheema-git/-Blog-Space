// the cloudinary taks will be done from here by me :

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration    
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload an image
const uploadOnCloudinary = async (localfilePath) => {
    try {
        if (!localfilePath) return null;
        const response = await cloudinary.uploader.upload(localfilePath, { resource_type: "auto" });
        console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localfilePath);
        return response.secure_url;
    } catch (error) {
        console.log("error occurred in uploading file:", error); 
        if (fs.existsSync(localfilePath)) {
            fs.unlinkSync(localfilePath);
        }
        return null;
    }
}

export { uploadOnCloudinary };