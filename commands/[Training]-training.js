const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Server = require('../models/server-settings'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('training')
        .setDescription('Post a training announcement.'),
    async execute(interaction) {
        try {
            const serverId = interaction.guild.id;
            const client = interaction.client;
            
            // Find server settings document
            const serverSettings = await Server.findOne({ serverId });
            if (!serverSettings) {
                try{
                await interaction.reply('Server settings not found. Please set them up using /setup.');
                return;
                }catch (error){
                    try{
                        intrraction.reply("If you've run the set up command and still see this please contact support.")
                    }catch{
                        intrraction.followUp("If you've run the set up command and still see this please contact support.")
                    }
                    }
                }

            if (!serverSettings || !serverSettings.sessionsID || !serverSettings.sessionsRole) {
                await interaction.reply('Sessions channel or role is not set up. View our setup guide for assistance.');
                return;
            }

            // Create embed for displaying settings
            const embed = new MessageEmbed()
                .setColor(serverSettings.trainingStartColor)
                .setTitle(serverSettings.trainingText)
                .setDescription(serverSettings.startMessage)
                .setFooter(serverSettings.Branding)
                .addFields(
                    { name: 'Status', value: 'Unlocked' },
                );

            // Get the channel and send the embed
            const channel = client.channels.cache.get(serverSettings.sessionsID);
            if (channel) {
                await channel.send(`<@&${serverSettings.sessionsRole}>`);
                await channel.send({ embeds: [embed] });
                await interaction.reply('Sent!');
            } else {
                await interaction.reply('The specified sessions channel does not exist.');
            }
        } catch (error) {
            console.error('Error sending training start message:', error);
            await interaction.reply('Error sending unlocked message. Please try again later.');
        }
    },
};
