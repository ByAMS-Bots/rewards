const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, TextChannel } = require('discord.js');
const User = require('../models/user'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Create a request to add points to a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you\'re adding points to.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount of points to add.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for adding points.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('notes')
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

            if (!appLogChannel || !(appLogChannel instanceof TextChannel)) {
                await interaction.reply('The requests channel does not exist. The request has NOT been sent.');
                return;
            }

            const embed = new MessageEmbed()
                .setColor('#071a1a')
                .setTitle(`${requestee.username} is requesting to add points to a user!`)
                .setDescription(`${user.username} is going to receive ${amount} point(s)`)
                .setFooter({ text:'MyPoints | The future of Ro-Rewards'})
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
                                points: 0,
                                tier: 'default' // Ensure tier is set appropriately
                            });
                        }

                        userDoc.points += amount;
                        await userDoc.save();

                        const approvedEmbed = new MessageEmbed()
                            .setColor('#071a1a')
                            .setTitle('Points Added')
                            .setDescription(`${requestee.username} has added ${amount} point(s) to your account. You now have ${userDoc.points} points.`)
                            .setFooter({ text:'MyPoints | The future of Ro-Rewards'})
                            .addFields(
                                { name: 'Guild ID', value: serverId }
                            );

                        await user.send({ embeds: [approvedEmbed] });
                        await requestee.send({ embeds: [approvedEmbed] });
                        await requestee.send(`The above message was sent to ${user.username}`);
                    } else {
                        const deniedEmbed = new MessageEmbed()
                            .setColor('#071a1a')
                            .setTitle('Points Addition Denied')
                            .setDescription(`${requestee.username} requested to add ${amount} points to ${user.username}'s account, but the request was denied.`)
                            .setFooter({ text:'MyPoints | The future of Ro-Rewards'})
                            .addFields(
                                { name: 'Guild ID', value: serverId }
                            );

                        await user.send({ embeds: [deniedEmbed] });
                        await requestee.send({ embeds: [deniedEmbed] });
                        await requestee.send(`The above message was sent to ${user.username}`);
                    }

                    await i.update({ content: `This request has been ${i.customId} by ${i.user.username}.`, components: [] });
                } catch (error) {
                    console.error('Error adding points:', error);
                    if (!i.replied && !i.deferred) {
                        await i.update({ content: 'Error processing the request. Please try again later.', components: [] });
                    }
                }
            });

            await interaction.reply('Your request has been sent!');
        } catch (error) {
            console.error('Error sending point addition request:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply('Error sending your request. Please try again later.');
            }
        }
    },
};
