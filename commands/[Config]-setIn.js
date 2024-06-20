const { SlashCommandBuilder } = require('@discordjs/builders');
const Server = require('../models/server-settings'); // Adjust path as needed
const { Permissions } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-setin')
        .setDescription('Set the channel inactivity requests go to.')
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel used to post inactivity requests.')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            await interaction.reply('You are unable to run this command because you don\'t have the required permission: Manage Messages.');
            return;
        }

        try {
            const serverId = interaction.guild.id;
            const trainingStartMessage = interaction.options.getChannel('channel');
            const ID = trainingStartMessage.id

            // Update or create server document in MongoDB
            const serverExists = await Server.exists({ serverId });
            if (!serverExists) {
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
            
            if (serverExists) {
                await Server.findOneAndUpdate({ serverId }, { $set: { inID: ID } });
            } else {
                const newServer = new Server({ serverId, inID: ID });
                await newServer.save();
            }

            await interaction.reply(`Set the Inactivity Requests channel to <#${ID}>.`);
        } catch (error) {
            console.error('Error setting inactivity channel:', error);
            await interaction.reply('Error setting inactivity channel. Please try again later.');
        }
    },
};
