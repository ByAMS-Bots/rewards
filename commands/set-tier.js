const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const User = require('../models/user'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-tier')
        .setDescription('Set the tier of a user based on their points')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user whose tier you want to set')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The tier upgrade reason.')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('user');
            const serverId = interaction.guild.id;
            const reason = interaction.options.getString('reason');

            const userDoc = await User.findOne({ userId: targetUser.id, serverID: serverId });

            if (!userDoc) {
                await interaction.reply(`${targetUser.username} does not have any points.`);
                return;
            }

            const tierOptions = [
                { label: 'Sapphire', value: 'sapphire', minPoints: 0, maxPoints: 700 },
                { label: 'Emerald', value: 'emerald', minPoints: 701, maxPoints: 1000 },
                { label: 'Diamond', value: 'diamond', minPoints: 1001, maxPoints: 1700 },
                { label: 'Cosmic Reserve', value: 'cosmic-reserve', minPoints: 1700, maxPoints: 2499 },
                { label: 'Opal', value: 'opal', minPoints: 2500, maxPoints: Infinity },
            ];

            const userCurrentTier = tierOptions.find(tier => userDoc.points >= tier.minPoints && userDoc.points <= tier.maxPoints);

            const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('select-tier')
                        .setPlaceholder('Select a tier')
                        .addOptions(tierOptions.map(tier => ({
                            label: tier.label,
                            description: `Points required: ${tier.minPoints} - ${tier.maxPoints}`,
                            value: tier.value,
                        })))
                );

            const embed = new MessageEmbed()
                .setColor('#071a1a')
                .setTitle(`Set Tier for ${targetUser.username}`)
                .setDescription(`Current points: ${userDoc.points}`)
                .addField(
                    {name: 'Suggested Tier', value: userCurrentTier ? userCurrentTier.label : 'None', true})
                .setFooter({text: 'MyPoints | The future of Ro-Rewards'});

            await interaction.reply({ embeds: [embed], components: [row] });

            const filter = i => i.customId === 'select-tier' && i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });

            collector.on('collect', async i => {
                const selectedTier = tierOptions.find(tier => tier.value === i.values[0]);
                const isWithinRange = userDoc.points >= selectedTier.minPoints && userDoc.points <= selectedTier.maxPoints;

                const approvalEmbed = new MessageEmbed()
                    .setColor('#071a1a')
                    .setTitle('Tier Upgrade Approval Needed')
                    .setDescription(`${interaction.user.username} is requesting to upgrade ${targetUser.username} to the ${selectedTier.label} tier.`)
                    .addFields(
                        { name: 'Points', value: userDoc.points.toString(), inline: true },
                        { name: 'Current Tier', value: userDoc.tier, inline: true },
                        { name: 'New Tier', value: selectedTier.label, inline: true },
                        { name: 'Reason', value: reason, inline: true },
                        { name: 'Within Points Range', value: isWithinRange ? 'Yes' : 'No', inline: true }
                    )
                    .setFooter({text: 'MyPoints | The future of Ro-Rewards'});

                const rowApproval = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('approve')
                            .setLabel('Approve')
                            .setStyle('SUCCESS'),
                        new MessageButton()
                            .setCustomId('deny')
                            .setLabel('Deny')
                            .setStyle('DANGER')
                    );

                const app_log = interaction.client.channels.cache.get("1259132400030453760"); // Replace with your log channel ID
                const approvalMessage = await app_log.send({ embeds: [approvalEmbed], components: [rowApproval] });

                const approvalFilter = btnInt => ['approve', 'deny'].includes(btnInt.customId) && btnInt.user.id === interaction.user.id;
                const approvalCollector = approvalMessage.createMessageComponentCollector({ approvalFilter, max: 1, time: 60000 });

                approvalCollector.on('collect', async btnInt => {
                    if (btnInt.customId === 'approve') {
                        userDoc.tier = selectedTier.label;
                        await userDoc.save();

                        const logEmbed = new MessageEmbed()
                            .setColor('#071a1a')
                            .setTitle('Tier Set')
                            .setDescription(`${interaction.user.username} set ${targetUser.username}'s tier to ${selectedTier.label}`)
                            .addFields(
                                { name: 'Points', value: userDoc.points.toString(), inline: true },
                                { name: 'Tier', value: userDoc.tier, inline: true }
                            )
                            .setFooter({text:'MyPoints | The future of Ro-Rewards'});

                        if (app_log) {
                            await app_log.send({ embeds: [logEmbed] });
                        }

                        const dmEmbed = new MessageEmbed()
                            .setColor('#071a1a')
                            .setTitle('Tier Upgraded')
                            .setDescription(`Congratulations! Your tier has been upgraded to ${selectedTier.label}.`)
                            .addFields(
                                { name: 'Current Points', value: userDoc.points.toString(), inline: true },
                                { name: 'New Tier', value: userDoc.tier, inline: true }
                            )
                            .setFooter({text:'MyPoints | The future of Ro-Rewards'});

                        await targetUser.send({ embeds: [dmEmbed] });
                        await interaction.user.send({ embeds: [dmEmbed] });
                        await interaction.user.send(`The above embed was sent to ${targetUser.username}`);
                        await btnInt.update({ content: `${targetUser.username}'s tier has been set to ${selectedTier.label}.`, embeds: [], components: [] });
                    } else {
                        await btnInt.update({ content: 'Tier upgrade request denied.', embeds: [], components: [] });
                    }
                });

                approvalCollector.on('end', collected => {
                    if (collected.size === 0) {
                        approvalMessage.edit({ content: 'Approval timed out.', components: [] });
                    }
                });

                // Reply indicating that the request has been sent
                await interaction.followUp('Tier selection request sent!');
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.followUp({ content: 'Tier selection timed out.', components: [] });
                }
            });

        } catch (error) {
            console.error('Error setting user tier:', error);
            await interaction.reply('Error setting user tier. Please try again later.');
        }
    },
};
