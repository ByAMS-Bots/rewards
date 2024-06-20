const { SlashCommandBuilder } = require('@discordjs/builders');
const Server = require('../models/server-settings'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-setshiftrole')
        .setDescription('Set the role that gets pinged for shifts')
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('The role pinged for shifts')
                .setRequired(true)),
    async execute(interaction) {
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
                await Server.findOneAndUpdate({ serverId }, { $set: { shiftRole: ID } });
            } else {
                const newServer = new Server({ serverId, shiftRole: ID });
                await newServer.save();
            }

            await interaction.reply(`Set the shift role to <@&${ID}>.`);
        } catch (error) {
            console.error('Error setting the shift role:', error);
            await interaction.reply('Error setting the shift role.');
        }
    },
};
