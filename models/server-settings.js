const mongoose = require('mongoose');

// Define the schema for server settings
const serverSchema = new mongoose.Schema({
    serverId: { type: String, required: true, unique: true },
    startMessage: { type: String, default: 'Not set up, please use the /help -> config to set up.' },
    slockMessage: { type: String, default: 'Not set up, please use the /help -> config to set up.' },
    endMessage: { type: String, default: 'Not set up, please use the /help -> config to set up.' },
    cancelMessage: { type: String, default: 'Not set up, please use the /help -> config to set up.' },
    shiftMessage: { type: String, default: 'Not set up, please use the /help -> config to set up.' },
    shiftEndMessage: { type: String, default: 'Not set up, please use the /help -> config to set up.' },
    shiftTitle: { type: String, default: 'Shift' },
    shiftColor: { type: String, default: '#e0f0e3' },
    trainingStartColor: { type: String, default: '#e0f0e3' },
    trainingLockedColor: { type: String, default: '#FDFD96' },
    trainingConcludedColor: { type: String, default: '#FF6961' },
    trainingText: { type: String, default: 'Training' },
    Branding: { type: String, default: 'I\'m ⚡ by CommissionsByAMS' },
    defaultColor:{type: String, default: "#071a1a"},
    premium: { type: String, default: 'false' },
    tester: { type: String, default: 'false' },
    inID: { type: String, default: 0 }, 
    sessionsID: { type: String, required: true, unique: true, default: "null" },
    suggestionsID: { type: Number, default: 0 },
    commandLogID: { type: Number, default: 0 },
    modID: { type: Number, default: 0 },
    approve: { type: String, default: 'Your IN request has been approved' },
    deny: { type: String, default: 'Your IN request has been denied' },
    sessionsRole: { type: String },
});

// Create and export the Server model based on the schema
const Server = mongoose.model('Server', serverSchema);

module.exports = Server;

