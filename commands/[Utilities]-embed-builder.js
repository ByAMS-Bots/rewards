const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Server = require('../models/server-settings'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed-builder')
        .setDescription('Create an embed')
        .addStringOption(option =>
            option
                .setName('title')
                .setDescription('Title of the embed')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('The body text')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('footer')
                .setDescription('The footer. Displayed in the format (Username) | (Footer)')
                .setRequired(true))
     
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel where the embed gets sent to')
                .setRequired(true))
    .addStringOption(option =>
        option
            .setName('color')
            .setDescription('The color of the embed')
            .setRequired(false)),
    async execute(interaction) {
        try {
            const serverId = interaction.guild.id;
            const user = interaction.user;
            const title = interaction.options.getString('title');
            const text = interaction.options.getString('text');
            const footer = interaction.options.getString('footer');
            const color = interaction.options.getString('color') || '#ffffff'; // Default color if none is provided
            const channel = interaction.options.getChannel('channel') || interaction.channel; // Default to the current channel if none is provided
            const serverSettings = await Server.findOne({ serverId });

            const embed = new MessageEmbed()
                .setColor(color)
                .setTitle(title)
                .setDescription(text)
                .setFooter({ text: `${user.username} | ${footer}` });


            // Send the embed to the specified channel
            await channel.send({ embeds: [embed] });

            await interaction.reply(`I've sent the embed to <#${channel.id}>.`);
        } catch (error) {
            console.error('Unable to send an embed', error);
            await interaction.reply('Error sending the embed. Please try again later.');
        }
    },
};
