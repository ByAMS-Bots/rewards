const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Server = require('../models/server-settings'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Send the server lock message.'),
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
                .setColor(serverSettings.trainingLockedColor)
                .setTitle(serverSettings.trainingText)
                .setDescription(serverSettings.slockMessage)
                .setFooter(serverSettings.Branding)
                .addFields(
                    { name: 'Status', value: 'Locked' },
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
            console.error('Error sending training lock message:', error);
            await interaction.reply('Error sending server locked message. Please try again later.');
        }
    },
};
