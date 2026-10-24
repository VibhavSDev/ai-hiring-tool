import mongoose from "mongoose";
import dns from "node:dns";

dns.setServers([
    '1.1.1.1',
    '8.8.8.8'
]);

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log(`\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error ", error);
        process.exit(1);
    }
}

export default connectDB;