const mongoose = require('mongoose');

// Define the schema for server settings
const serverSchema = new mongoose.Schema({
    serverId: { type: String, required: true, unique: true },
    name: { type: String, default: 'This server is not set up' },
    activeDiscount: { type: String, default: 'no' },
  
});

// Create and export the Server model based on the schema
const Server = mongoose.model('Server', serverSchema);

module.exports = Server;

