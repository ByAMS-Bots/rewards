const { SlashCommandBuilder } = require('@discordjs/builders');
const Server = require('../models/server-settings'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-trainingstart')
        .setDescription('Set the unlocked message for training sessions.')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The message used for the training start message.')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const serverId = interaction.guild.id;
            const trainingStartMessage = interaction.options.getString('message');

            // Update or create server document in MongoDB
            const serverExists = await Server.exists({ serverId });
            if (serverExists) {
                await Server.findOneAndUpdate({ serverId }, { $set: { startMessage: trainingStartMessage } });
            } else {
                const newServer = new Server({ serverId, startMessage: trainingStartMessage });
                await newServer.save();
            }

            await interaction.reply(`Training start message updated successfully to \`${trainingStartMessage}\`.`);
        } catch (error) {
            console.error('Error setting training start message:', error);
            await interaction.reply('Error setting training start message. Please try again later.');
        }
    },
};
