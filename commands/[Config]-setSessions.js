const { SlashCommandBuilder } = require('@discordjs/builders');
const Server = require('../models/server-settings'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-settraining')
        .setDescription('Set the channel training messages go to.')
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel used to post training messages.')
                .setRequired(true)),
    async execute(interaction) {
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
                await Server.findOneAndUpdate({ serverId }, { $set: { sessionsID: ID } });
            } else {
                const newServer = new Server({ serverId, sessionsID: ID });
                await newServer.save();
            }

            await interaction.reply(`Training channel updated successfully to ${trainingStartMessage}.`);
        } catch (error) {
            console.error('Error setting Training channel', error);
            await interaction.reply('Error Training sessions channel.. Please try again later.');
        }
    },
};
