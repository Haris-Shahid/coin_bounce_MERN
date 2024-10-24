const mongoose = require('mongoose');
const { MONGODB_CONNECTION_STRING } = require('../config/index');

const dbConnect = async () => {
    try{
        const initializeConnection = await mongoose.connect(MONGODB_CONNECTION_STRING);
        console.log(`Database connected to host: ${initializeConnection.connection.host}`); 
    }catch (error) {
        console.log(`Error: ${error}`);
    }
}

module.exports = dbConnect;