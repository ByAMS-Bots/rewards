const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: String,
    points: { type: Number, default: 0 },
    lastActive: Date
});

module.exports = mongoose.model('User', userSchema);
