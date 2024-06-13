const { SlashCommandBuilder } = require('@discordjs/builders');
const Server = require('../models/server-settings'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-trainingconcluded')
        .setDescription('Set the concluded message for training sessions.')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The message used for the training concluded message.')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const serverId = interaction.guild.id;
            const trainingStartMessage = interaction.options.getString('message');

            // Update or create server document in MongoDB
            const serverExists = await Server.exists({ serverId });
            if (serverExists) {
                await Server.findOneAndUpdate({ serverId }, { $set: { endMessage: trainingStartMessage } });
            } else {
                const newServer = new Server({ serverId, endMessage: trainingStartMessage });
                await newServer.save();
            }

            await interaction.reply(`Training concluded message updated successfully to \`${trainingStartMessage}\`.`);
        } catch (error) {
            console.error('Error setting training concluded message:', error);
            await interaction.reply('Error setting concluded start message. Please try again later.');
        }
    },
};
