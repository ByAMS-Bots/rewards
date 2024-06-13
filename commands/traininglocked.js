const { SlashCommandBuilder } = require('@discordjs/builders');
const Server = require('../models/server-settings'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-traininglock')
        .setDescription('Set the server locked message for training sessions.')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The message used for the training lock message.')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const serverId = interaction.guild.id;
            const trainingStartMessage = interaction.options.getString('message');

            // Update or create server document in MongoDB
            const serverExists = await Server.exists({ serverId });
            if (serverExists) {
                await Server.findOneAndUpdate({ serverId }, { $set: { slockMessage: trainingStartMessage } });
            } else {
                const newServer = new Server({ serverId, slockMessage: trainingStartMessage });
                await newServer.save();
            }

            await interaction.reply(`Training locked message updated successfully to \`${trainingStartMessage}\`.`);
        } catch (error) {
            console.error('Error setting training locked message:', error);
            await interaction.reply('Error setting locked start message. Please try again later.');
        }
    },
};
