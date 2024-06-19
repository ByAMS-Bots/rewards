const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    serverID: { type: String, required: true },
    username: { type: String, required: true },
    points: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
});

// Composite unique index on userId and serverID
userSchema.index({ userId: 1, serverID: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
