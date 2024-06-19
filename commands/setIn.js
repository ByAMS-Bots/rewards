const { SlashCommandBuilder } = require('@discordjs/builders');
const Server = require('../models/server-settings'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-setin')
        .setDescription('Set the channel inactivity requests go to.')
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel used to post inactivity requests.')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const serverId = interaction.guild.id;
            const trainingStartMessage = interaction.options.getChannel('channel');
            const ID = trainingStartMessage.id

            // Update or create server document in MongoDB
            const serverExists = await Server.exists({ serverId });
            if (serverExists) {
                await Server.findOneAndUpdate({ serverId }, { $set: { inID: ID } });
            } else {
                const newServer = new Server({ serverId, inID: ID });
                await newServer.save();
            }

            await interaction.reply(`Set the Inactivity Requests channel to <#${ID}>.`);
        } catch (error) {
            console.error('Error setting inactivity channel:', error);
            await interaction.reply('Error setting inactivity channel. Please try again later.');
        }
    },
};
