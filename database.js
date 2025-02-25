const mongoose = require('mongoose');
const User = require('./models/user.js');

const uri = process.env['MONGO_CONNECT'];



mongoose.connect(uri)
    .then(() => {
        console.log('Connected to MongoDB');

        // Drop the existing index on userId, if it exists
        User.collection.dropIndex('userId_1')
            .then(() => console.log('Dropped the existing userId index'))
            .catch(error => console.log('No existing userId index to drop, or another issue:', error.message));

        // Create the new composite index
        User.collection.createIndex({ userId: 1, serverID: 1 }, { unique: true })
            .then(() => console.log('Created composite index on userId and serverID'))
            .catch(error => console.error('Error creating index:', error.message));
    })
    .catch(err => console.error('Failed to connect to MongoDB', err));
