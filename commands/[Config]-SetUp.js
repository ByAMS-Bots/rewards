// Example of slash command options and reading option input
const { SlashCommandBuilder } = require('@discordjs/builders');
const Server = require(`../models/server-settings.js`)
module.exports = {
	data: new SlashCommandBuilder()
		.setName('config-setup')
		.setDescription('Set up the bot in your server'),
	
	async execute(interaction) {
		const serverId = interaction.guild.id
	const serverExists = await Server.exists({ serverId });
		
	if (serverExists) {
			interaction.reply("This server is already set up and in our database contact support to get it removed.")
	} else {
		
			const newServer = new Server({serverId});
			await newServer.save();
		interaction.reply("You are now able to configure your commands in this server.")
	}

	},
};