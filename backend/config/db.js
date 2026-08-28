const mongoose = require('mongoose');

const connectDb = async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Mongo DB Connected');
    } catch(err) {
        console.log('Error in connecting to DB', err.message);
        process.exit(1);
    }
}
module.exports = connectDb;