const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, TextChannel } = require('discord.js');
const User = require('../models/user'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Create a request to remove points from a user.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user you\'re removing points from.')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('The amount of points to remove.')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for removing points.')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('notes')
                .setDescription('Optional notes.')
                .setRequired(false)),
    async execute(interaction) {
        try {
            const client = interaction.client;
            const serverId = interaction.guildId; // Use guildId instead of guild.id
            const requestee = interaction.user;
            const user = interaction.options.getUser('user');
            const amount = interaction.options.getInteger('amount');
            const reason = interaction.options.getString('reason');
            const notes = interaction.options.getString('notes') || 'N/A';
            const appLogChannelId = '1259132400030453760'; // Replace with your channel ID
            const appLogChannel = interaction.guild.channels.cache.get(appLogChannelId);

            // Check if the appLogChannel exists and is a TextChannel
            if (!appLogChannel || !(appLogChannel instanceof TextChannel)) {
                await interaction.reply('The requests channel does not exist. The request has NOT been sent.');
                return;
            }

            const embed = new MessageEmbed()
                .setColor('#071a1a')
                .setTitle(`${requestee.username} is requesting to remove points from a user!`)
                .setDescription(`${user.username} is going to have ${amount} point(s) removed`)
                .setFooter({text:'MyPoints | The future of Ro-Rewards'})
                .addFields(
                    { name: 'User', value: user.username },
                    { name: 'Amount', value: amount.toString() },
                    { name: 'Reason', value: reason },
                    { name: 'Notes', value: notes }
                );

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('approved')
                        .setLabel('Approve')
                        .setStyle('SUCCESS'),
                    new MessageButton()
                        .setCustomId('denied')
                        .setLabel('Deny')
                        .setStyle('DANGER')
                );

            const message = await appLogChannel.send({ embeds: [embed], components: [row] });

            const filter = i => i.customId === 'approved' || i.customId === 'denied';
            const collector = message.createMessageComponentCollector({ filter, max: 1 });

            collector.on('collect', async i => {
                try {
                    if (i.customId === 'approved') {
                        let userDoc = await User.findOne({ userId: user.id, serverID: serverId });

                        if (!userDoc) {
                            userDoc = new User({
                                userId: user.id,
                                serverID: serverId,
                                username: user.username,
                                points: 0, // New user starts with 0 points
                            });
                        }

                        // Subtract points only if userDoc exists
                        if (userDoc) {
                            userDoc.points -= amount;
                            await userDoc.save();

                            const approvedEmbed = new MessageEmbed()
                                .setColor('#071a1a')
                                .setTitle('Points Removed')
                                .setDescription(`${requestee.username} has removed ${amount} point(s) from ${user.username}'s account. They now have ${userDoc.points} points remaining.`)
                                .setFooter({text:'MyPoints | The future of Ro-Rewards'})
                                .addFields(
                                    { name: 'Guild ID', value: serverId }
                                );

                            await user.send({ embeds: [approvedEmbed] });
                            await requestee.send({ embeds: [approvedEmbed] });
                            await requestee.send(`The above message was sent to ${user.username}`);
                        }
                    } else {
                        const deniedEmbed = new MessageEmbed()
                            .setColor('#071a1a')
                            .setTitle('Points Removal Denied')
                            .setDescription(`${requestee.username} requested to remove ${amount} points from ${user.username}'s account, but the request was denied.`)
                            .setFooter({text:'MyPoints | The future of Ro-Rewards'})
                            .addFields(
                                { name: 'Guild ID', value: serverId }
                            );

                        await user.send({ embeds: [deniedEmbed] });
                        await requestee.send({ embeds: [deniedEmbed] });
                        await requestee.send(`The above message was sent to ${user.username}`);
                    }

                    await i.update({ content: `This request has been ${i.customId === 'approved' ? 'approved' : 'denied'} by ${requestee.username}.`, components: [] });
                } catch (error) {
                    console.error('Error removing points:', error);
                    await i.update({ content: 'Error removing points. Please try again later.', components: [] });
                }
            });

            await interaction.reply('Your request has been sent!');
        } catch (error) {
            console.error('Error sending point removal request:', error);
            await interaction.reply('Error sending your request. Please try again later.');
        }
    },
};
