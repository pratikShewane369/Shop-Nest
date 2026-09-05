require('dotenv').config();
const connectDb = require('./config/db');
const app = require('./app');

connectDb();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});