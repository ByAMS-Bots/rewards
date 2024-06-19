const { SlashCommandBuilder } = require('@discordjs/builders');
const Server = require('../models/server-settings'); // Adjust path as needed

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
        try {
            const serverId = interaction.guild.id;
            const trainingStartMessage = interaction.options.getRole('role');
            const ID = trainingStartMessage.id

            // Update or create server document in MongoDB
            const serverExists = await Server.exists({ serverId });
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
