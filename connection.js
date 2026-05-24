import mongoose from "mongoose"
const DBConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
    }
    catch (err) {
        throw new Error(` Database connection failed: ${err.message}`);
    }
}

export { DBConnection };