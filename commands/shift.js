const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Server = require('../models/server-settings'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shift')
        .setDescription('Send the shift message.'),
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
                .setColor(serverSettings.shiftColor)
                .setTitle(serverSettings.shiftTitle)
                .setDescription(serverSettings.shiftMessage)
                .setFooter(serverSettings.Branding)
               

            // Get the channel and send the embed
            const channel = client.channels.cache.get(serverSettings.sessionsID);
            if (channel) {
                await channel.send({ embeds: [embed] });
                await interaction.reply('Sent!');
            } else {
                await interaction.reply('The specified sessions channel does not exist.');
            }
        } catch (error) {
            console.error('Error sending shift start message:', error);
            await interaction.reply('Error sending start message. Please try again later.');
        }
    },
};
