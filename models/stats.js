const mongoose = require('mongoose');

const userStats = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: String,
    shifts: { type: Number, default: 0 },
    trainings: { type: Number, default: 0 },
    modRan: { type: Number, default: 0 },
    modRecieved: { type: Number, default: 0 },
    INsSubmitted: { type: Number, default: 0 },
    warnings: { type: Number, default: 0 },
    strikes: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', userStats);
