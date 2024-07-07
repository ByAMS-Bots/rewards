const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, TextChannel } = require('discord.js');
const User = require('../models/user'); // Adjust path as needed

const rewards = {
    'spin-wheel-entry': { 
        name: 'Spin Wheel Entry', 
        cost: 5,
        description: 'An entry to the spin wheel which is run at the end of each month. Open a ticket in the commissions ByAMS server to buy. It\'s not guaranteed you win something.'
    },
    '25-robux-discount': { 
        name: '25 Robux Discount', 
        cost: 150,
        description: 'Save 25 Robux by using the discount. Limit 1 discount per order.'
    },
    '100-robux-discount': { 
        name: '100 Robux Discount', 
        cost: 450,
        description: 'Save 100 Robux by using the discount. Limit 1 discount per order.'
    },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('redeem')
        .setDescription('Redeem your points for rewards'),
    async execute(interaction) {
        try {
            const user = interaction.user;
            const serverId = interaction.guildId; // Use guildId instead of guild.id

            // Create dropdown options dynamically based on available rewards
            const options = Object.keys(rewards).map(key => ({
                label: `${rewards[key].name} - ${rewards[key].cost} points`,
                value: key
            }));

            const selectMenu = new MessageSelectMenu()
                .setCustomId('select-reward')
                .setPlaceholder('Select a reward')
                .addOptions(options);

            const embed = new MessageEmbed()
                .setColor('#071a1a')
                .setTitle('Select a Reward to Redeem')
                .setDescription('Choose one of the rewards below to redeem using your points:')
                .setFooter({text:'MyPoints | The future of Ro-Rewards'});

            const row = new MessageActionRow()
                .addComponents(selectMenu);

            const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

            const filter = i => i.user.id === user.id && i.customId === 'select-reward';
            const collector = message.createMessageComponentCollector({ filter, max: 1, time: null }); // Set timeout to null for no timeout

            collector.on('collect', async i => {
                const rewardKey = i.values[0];
                const reward = rewards[rewardKey];
                const userDoc = await User.findOne({ userId: user.id, serverID: serverId });

                if (!userDoc) {
                    await i.reply(`${user.username} does not have any points.`);
                    return;
                }

                if (userDoc.points < reward.cost) {
                    await i.reply(`You do not have enough points to redeem ${reward.name}. You need ${reward.cost} points.`);
                    return;
                }

                const buyEmbed = new MessageEmbed()
                    .setColor('#071a1a')
                    .setTitle(`Redeem ${reward.name}`)
                    .setDescription(`Are you sure you want to redeem **${reward.name}** for **${reward.cost}** points?\n\n**Description:** ${reward.description}`)
                    .setFooter({text:'MyPoints | The future of Ro-Rewards'});

                const rowBuy = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('confirm')
                            .setLabel('Buy')
                            .setStyle('SUCCESS'),
                        new MessageButton()
                            .setCustomId('cancel')
                            .setLabel('Cancel')
                            .setStyle('DANGER')
                    );

                await i.update({ embeds: [buyEmbed], components: [rowBuy] });

                const buttonFilter = btn => ['confirm', 'cancel'].includes(btn.customId) && btn.user.id === user.id;
                const buttonCollector = message.createMessageComponentCollector({ buttonFilter, max: 1, time: null }); // Set timeout to null for no timeout

                buttonCollector.on('collect', async btn => {
                    if (btn.customId === 'confirm') {
                        // Deduct points
                        userDoc.points -= reward.cost;
                        await userDoc.save();

                        // Send redemption message to a designated channel
                        const redemptionChannelId = '1259132400030453760'; // Replace with your channel ID
                        const redemptionChannel = interaction.guild.channels.cache.get(redemptionChannelId);

                        if (!redemptionChannel || !(redemptionChannel instanceof TextChannel)) {
                            await interaction.editReply('Error: Unable to find or access the redemption channel.');
                            return;
                        }

                        const redemptionMessage = await redemptionChannel.send({
                            embeds: [new MessageEmbed()
                                .setColor('#f7cac9')
                                .setTitle('Redemption Notification')
                                .setDescription(`${user} has redeemed **${reward.name}**.`)
                                .setFooter({text:'MyPoints | The future of Ro-Rewards'})
                            ],
                            components: [
                                new MessageActionRow().addComponents(
                                    new MessageButton()
                                        .setCustomId('used')
                                        .setLabel('Used')
                                        .setStyle('DANGER')
                                )
                            ]
                        });

                        const usedButtonFilter = buttonInteraction => buttonInteraction.customId === 'used' && buttonInteraction.message.id === redemptionMessage.id;
                        const usedButtonCollector = redemptionChannel.createMessageComponentCollector({ usedButtonFilter, time: null }); // Set timeout to null for no timeout

                        usedButtonCollector.on('collect', async usedInteraction => {
                            const isUsed = usedInteraction.component.label === 'Used';

                            await usedInteraction.update({
                                embeds: [new MessageEmbed()
                                    .setColor('#f7cac9')
                                    .setTitle('Redemption Notification')
                                    .setDescription(`${user} has redeemed **${reward.name}**. ${isUsed ? 'Used' : 'Unused'} by ${usedInteraction.user.username}`)
                                    .setFooter({text:'MyPoints | The future of Ro-Rewards'})
                                ],
                                components: [new MessageActionRow().addComponents(
                                    new MessageButton()
                                        .setCustomId(isUsed ? 'unused' : 'used')
                                        .setLabel(isUsed ? 'Unused' : 'Used')
                                        .setStyle(isUsed ? 'SUCCESS' : 'DANGER')
                                )]
                            });

                            // Send a standard text message when used or unused
                            await redemptionChannel.send(`${user} has ${isUsed ? 'used' : 'unused'} the reward: **${reward.name}**.`);
                        });

                        usedButtonCollector.on('end', () => {
                            if (redemptionMessage.components.length > 0) {
                                redemptionMessage.edit({
                                    embeds: [redemptionMessage.embeds[0]],
                                    components: []
                                });
                            }
                        });

                        // Update user interaction to confirm redemption
                        const confirmedEmbed = new MessageEmbed()
                            .setColor('#071a1a')
                            .setTitle('Reward Redeemed')
                            .setDescription(`You have successfully redeemed **${reward.name}** for **${reward.cost}** points.\n\n**Description:** ${reward.description}`)
                            .addField('Remaining Points', userDoc.points.toString(), true)
                            .setFooter({text:'MyPoints | The future of Ro-Rewards'});

                        await btn.update({ embeds: [confirmedEmbed], components: [] });
                    } else {
                        await btn.update({ content: 'Redemption canceled.', components: [] });
                    }
                });

                buttonCollector.on('end', collected => {
                    if (collected.size === 0) {
                        interaction.editReply({ content: 'Redemption confirmation timed out.', components: [] });
                    }
                });
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: 'Redemption selection timed out.', components: [] });
                }
            });
        } catch (error) {
            console.error('Error redeeming reward:', error);
            await interaction.reply('Error redeeming your reward. Please try again later.');
        }
    },
};
