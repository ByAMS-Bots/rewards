const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    serverID: { type: String, required: true },
    username: { type: String, required: true },
    points: { type: Number, default: 0 },
    tier: { type: String, required: true, default: 'Sapphire' },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
