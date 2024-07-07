const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const User = require('../models/user'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('points')
        .setDescription('View the amount of points a user has')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user whose points you want to view')
                .setRequired(false)),
    async execute(interaction) {
        try {
            const user = interaction.options.getUser('user') || interaction.user;
            const serverId = interaction.guild.id;

            const userDoc = await User.findOne({ userId: user.id, serverID: serverId });

            if (!userDoc) {
                await interaction.reply(`${user.username} does not have any points.`);
                return;
            }

            const embed = new MessageEmbed()
                .setColor('#071a1a')
                .setTitle(`${user.username}'s Points`)
                .addFields(
                    { name: 'Points', value: userDoc.points.toString(), inline: true },
                    { name: 'Tier', value: userDoc.tier, inline: true }
                )
                .setFooter({text:'MyPoints | The future of Ro-Rewards'});

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching user points:', error);
            await interaction.reply('Error fetching user points. Please try again later.');
        }
    },
};
