const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Server = require('../models/server-settings'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('conclude')
        .setDescription('Send the concluded message.'),
    async execute(interaction) {
        try {
            const serverId = interaction.guild.id;
            const client = interaction.client;

            // Find server settings document
            const serverSettings = await Server.findOne({ serverId });

            if (!serverSettings || serverSettings.sessionsID === "null") {
                await interaction.reply('Sessions channel is not set up. View our setup guide for assistance.');
                return;
            }

            // Create embed for displaying settings
            const embed = new MessageEmbed()
                .setColor(serverSettings.trainingConcludedColor)
                .setTitle(serverSettings.trainingText)
                .setDescription(serverSettings.endMessage)
                .setFooter(serverSettings.Branding)
                .addFields(
                    { name: 'Status', value: 'Concluded' },
                );

            // Get the channel and send the embed
            const channel = client.channels.cache.get(serverSettings.sessionsID);
            if (channel) {
                await channel.send({ embeds: [embed] });
                await interaction.reply('Sent!');
            } else {
                await interaction.reply('The specified sessions channel does not exist.');
            }
        } catch (error) {
            console.error('Error sending training concluded message:', error);
            await interaction.reply('Error sending concluded message. Please try again later.');
        }
    },
};
