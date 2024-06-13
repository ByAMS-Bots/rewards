const { SlashCommandBuilder } = require('@discordjs/builders');
const Server = require('../models/server-settings'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-shiftend')
        .setDescription('Set the end message for shifts.')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The message used for the shift end message.')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const serverId = interaction.guild.id;
            const trainingStartMessage = interaction.options.getString('message');

            // Update or create server document in MongoDB
            const serverExists = await Server.exists({ serverId });
            if (serverExists) {
                await Server.findOneAndUpdate({ serverId }, { $set: { shiftEndMessage: trainingStartMessage } });
            } else {
                const newServer = new Server({ serverId, shiftEndMessage: trainingStartMessage });
                await newServer.save();
            }

            await interaction.reply(`Shift end message updated successfully to \`${trainingStartMessage}\`.`);
        } catch (error) {
            console.error('Error setting shift end message:', error);
            await interaction.reply('Error setting shift end message. Please try again later.');
        }
    },
};
