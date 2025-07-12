const mongoose = require('mongoose');

const connectDB = async () => {
    console.log(process.env.MONGO_URI)
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        // Mongoose 6+ no longer needs these options, but they don't hurt
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;
