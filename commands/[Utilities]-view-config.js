const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Server = require('../models/server-settings'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view-settings')
        .setDescription('View current server settings.'),
    async execute(interaction) {
        try {
            const serverId = interaction.guild.id;

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
            

            // Create embed for displaying settings
            const embed = new MessageEmbed()
                .setColor('#778DA9')
                .setTitle(`Server Settings for ${interaction.guild.name}`)
                .addFields(
                    { name: 'Start Message', value: serverSettings.startMessage || 'Not set up' },
                    { name: 'Slock Message', value: serverSettings.slockMessage || 'Not set up' },
                    { name: 'End Message', value: serverSettings.endMessage || 'Not set up' },
                    { name: 'Cancel Message', value: serverSettings.cancelMessage || 'Not set up' },
                    { name: 'Shift Start Message', value: serverSettings.shiftMessage || 'Not set up' },
                    { name: 'Shift End Message', value: serverSettings.shiftEndMessage || 'Not set up' },
                    { name: 'Premium', value: serverSettings.premium || 'false' },
                    { name: 'Training Channel', value: `<#${serverSettings.sessionsID}>` || 'Not set up' },
                    { name: 'Inactivity Channel', value: `<#${serverSettings.inID}>` || 'Not set up' },
                   // { name: 'Suggestions ID', value: serverSettings.suggestionsID || 'Not set up' },
                   // { name: 'Command Log ID', value: serverSettings.commandLogID || 'Not set up' },
                  //  { name: 'Mod ID', value: serverSettings.modID || 'Not set up' }
                );

            // Send embed as a reply
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error viewing server settings:', error);
  //          await interaction.reply('Error viewing server settings. Please try again later.');
        }
    },
};
