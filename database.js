const mongoose = require('mongoose');

const uri = process.env['MONGO_CONNECT']


mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

module.exports = mongoose;

