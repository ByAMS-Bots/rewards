const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const Server = require('../models/server-settings'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inactivity-request')
        .setDescription('Request an inactivity notice')
        .addStringOption(option =>
            option
                .setName('roblox_username')
                .setDescription('Your Roblox username')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('date_of_leave')
                .setDescription('The day you leave')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('date_of_return')
                .setDescription('The day you return')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('notes')
                .setDescription('Any optional notes')
                .setRequired(false)),
    async execute(interaction) {
        try {
            const client = interaction.client;
            const serverId = interaction.guild.id;
            const requestee = interaction.user;
            const rblx = interaction.options.getString('roblox_username');
            const dateOfLeave = interaction.options.getString('date_of_leave');
            const dateOfReturn = interaction.options.getString('date_of_return');
            const notes = interaction.options.getString('notes') ?? 'N/A';

            const serverSettings = await Server.findOne({ serverId });

            if (!serverSettings) {
                await interaction.reply('Server settings not found.');
                return;
            }

            const insender = serverSettings.inID;

            if (!insender) {
                await interaction.reply('The inactivity requests channel does not exist.');
                return;
            }

            // Fetch the channel using client
            const app_log = client.channels.cache.get(insender);

            if (!app_log) {
                await interaction.reply('The Inactivity Requests channel does not exist');
                return;
            }

            const embed = new MessageEmbed()
                .setColor(serverSettings.defaultColor)
                .setTitle(`${requestee.username}'s Inactivity Request`)
                .setFooter({ text: serverSettings.Branding })
                .addFields(
                    { name: 'Roblox Username', value: rblx },
                    { name: 'Date of Leave', value: dateOfLeave },
                    { name: 'Date of Return', value: dateOfReturn },
                    { name: 'Notes', value: notes },
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
                        .setStyle('DANGER'),
                );

            const message = await app_log.send({ embeds: [embed], components: [row] });

            const filter = i => i.customId === 'approved' || i.customId === 'denied';
            const collector = message.createMessageComponentCollector({ filter, max: 1 });

            collector.on('collect', async i => {
                let responseMessage;
                if (i.customId === 'approved') {
                    const approved = new MessageEmbed()
                    .setColor(serverSettings.defaultColor)
                    .setTitle(`Inactivity Request Update`)
                        .setDescription(`Your inacitivty request has been accepted by ${i.user.username} onbehalf of ${i.guild.name}`)
                    .setFooter({ text: serverSettings.Branding })
                    .addFields(
                        { name: 'Guild ID', value: serverId}
                        )

                     await requestee.send({ embeds: [approved]});
                    
                } else {
                    const denied = new MessageEmbed()
                    .setColor(serverSettings.defaultColor)
                    .setTitle(`Inactivity Request Update`)
                        .setDescription(`Your inacitivty request has been denied by ${i.user.username} onbehalf of ${i.guild.name}`)
                    .setFooter({ text: serverSettings.Branding })
                    .addFields(
                        { name: 'Guild ID', value: serverId}
                        )
                      await requestee.send({ embeds: [denied]});

                }

                await i.update({ content: `This request has been ${i.customId} by ${i.user.username}.`, components: [] });

             

            });

            await interaction.reply('Your inactivity request has been sent!');
        } catch (error) {
            console.error('Error sending inactivity request:', error);
            await interaction.reply('Error sending your inactivity request. Please try again later.');
        }
    },
};
