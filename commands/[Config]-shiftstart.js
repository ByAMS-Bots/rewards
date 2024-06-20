const { SlashCommandBuilder } = require('@discordjs/builders');
const Server = require('../models/server-settings'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-shiftstart')
        .setDescription('Set the start message for shifts.')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The message used for the shift start message.')
                .setRequired(true)),
    async execute(interaction) {
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
                await Server.findOneAndUpdate({ serverId }, { $set: { shiftMessage: trainingStartMessage } });
            } else {
                const newServer = new Server({ serverId, shiftMessage: trainingStartMessage });
                await newServer.save();
            }

            await interaction.reply(`Shift start message updated successfully to \`${trainingStartMessage}\`.`);
        } catch (error) {
            console.error('Error setting shift start message:', error);
            await interaction.reply('Error setting shift start message. Please try again later.');
        }
    },
};
