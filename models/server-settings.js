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
    premium: { type: String, default: 'false' },
    tester: { type: String, default: 'false' },
    inID: { type: Number, default: 0 }, 
    sessionsID: { type: String, required: true, unique: true },
    suggestionsID: { type: Number, default: 0 },
    commandLogID: { type: Number, default: 0 },
    modID: { type: Number, default: 0 }
});

// Create and export the Server model based on the schema
const Server = mongoose.model('Server', serverSchema);

module.exports = Server;

