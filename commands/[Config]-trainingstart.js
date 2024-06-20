const { SlashCommandBuilder } = require('@discordjs/builders');
const Server = require('../models/server-settings'); // Adjust path as needed
const { Permissions } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-trainingstart')
        .setDescription('Set the unlocked message for training sessions.')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The message used for the training start message.')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            await interaction.reply('You are unable to run this command because you don\'t have the required permission: Manage Messages.');
            return;
        }

        try {
            const serverId = interaction.guild.id;
            const trainingStartMessage = interaction.options.getString('message');

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
                await Server.findOneAndUpdate({ serverId }, { $set: { startMessage: trainingStartMessage } });
            } else {
                const newServer = new Server({ serverId, startMessage: trainingStartMessage });
                await newServer.save();
            }

            await interaction.reply(`Training start message updated successfully to \`${trainingStartMessage}\`.`);
        } catch (error) {
            console.error('Error setting training start message:', error);
            await interaction.reply('Error setting training start message. Please try again later.');
        }
    },
};
