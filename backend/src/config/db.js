import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // We connect to MongoDB using the connection string in our .env file.
    // If process.env.MONGO_URI is missing or invalid, this will throw an error.
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // If we can't connect to the database, the server shouldn't keep running.
    process.exit(1);
  }
};

export default connectDB;
