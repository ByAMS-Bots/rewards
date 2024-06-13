const { SlashCommandBuilder } = require('@discordjs/builders');
const Server = require('../models/server-settings'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-trainingcanceled')
        .setDescription('Set the canceled message for training sessions.')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The message used for the training canceled message.')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const serverId = interaction.guild.id;
            const trainingStartMessage = interaction.options.getString('message');

            // Update or create server document in MongoDB
            const serverExists = await Server.exists({ serverId });
            if (serverExists) {
                await Server.findOneAndUpdate({ serverId }, { $set: { cancelMessage: trainingStartMessage } });
            } else {
                const newServer = new Server({ serverId, cancelMessage: trainingStartMessage });
                await newServer.save();
            }

            await interaction.reply(`Training canceled message updated successfully to \`${trainingStartMessage}\`.`);
        } catch (error) {
            console.error('Error setting training canceled message:', error);
            await interaction.reply('Error setting training canceled message. Please try again later.');
        }
    },
};
