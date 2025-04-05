import mongoose from 'mongoose';

export const runDB = async (MONGO_URL: string) => {
    try {
        mongoose.Promise = Promise;
        await mongoose.connect(MONGO_URL);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connect:', err);
        process.exit(1);
    }

    mongoose.connection.on('error', (err: Error) => {
        console.error('MongoDB connection error:', err);
    });
};
