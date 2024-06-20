const { SlashCommandBuilder } = require('@discordjs/builders');
const Server = require('../models/server-settings'); // Adjust path as needed
const { Permissions } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-setsessionsrole')
        .setDescription('Set the role that gets pinged for sessions')
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('The role pinged for sessions')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            await interaction.reply('You are unable to run this command because you don\'t have the required permission: Manage Messages.');
            return;
        }

        try {
            const serverId = interaction.guild.id;
            const trainingStartMessage = interaction.options.getRole('role');
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
                await Server.findOneAndUpdate({ serverId }, { $set: { sessionsRole: ID } });
            } else {
                const newServer = new Server({ serverId, sessionsRole: ID });
                await newServer.save();
            }

            await interaction.reply(`Set the sessions role to <@&${ID}>.`);
        } catch (error) {
            console.error('Error setting the sessions role:', error);
            await interaction.reply('Error setting the sessions role.');
        }
    },
};
