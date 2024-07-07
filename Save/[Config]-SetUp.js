// Example of slash command options and reading option input
const { SlashCommandBuilder } = require('@discordjs/builders');
const Server = require(`../models/server-settings.js`)
const { Permissions } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('config-setup')
		.setDescription('Set up the bot in your server'),
	
	async execute(interaction) {
		if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
			await interaction.reply('You are unable to run this command because you don\'t have the required permission: Manage Messages.');
			return;
		}

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