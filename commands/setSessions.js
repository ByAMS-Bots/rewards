const { SlashCommandBuilder } = require('@discordjs/builders');
const Server = require('../models/server-settings'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-setsesions')
        .setDescription('Set the emd message for shifts.')
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel used to post shift/training messages..')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const serverId = interaction.guild.id;
            const trainingStartMessage = interaction.options.getChannel('channel');
            const ID = trainingStartMessage.id

            // Update or create server document in MongoDB
            const serverExists = await Server.exists({ serverId });
            if (serverExists) {
                await Server.findOneAndUpdate({ serverId }, { $set: { sessionsID: ID } });
            } else {
                const newServer = new Server({ serverId, sessionsID: ID });
                await newServer.save();
            }

            await interaction.reply(`Sessions channel updated successfully to ${trainingStartMessage}.`);
        } catch (error) {
            console.error('Error setting shift end message:', error);
            await interaction.reply('Error setting shift end message. Please try again later.');
        }
    },
};
