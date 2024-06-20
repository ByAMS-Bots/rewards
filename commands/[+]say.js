// Example of slash command options and reading option input
const { SlashCommandBuilder } = require('@discordjs/builders');
const Server = require("../models/server-settings")
const { Permissions } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('p-say')
		.setDescription('Get the bot to say something.')
		.addStringOption(option => option.setName('input').setDescription('Want you want the bot to say')), // user option defined
	async execute(interaction) {
		const serverId = interaction.guild.id
		const serverSettings = await Server.findOne({ serverId });
		 const text = interaction.options.getString('input')?? 'No input provided';;
		if (!serverSettings) {
				try{
				await interaction.reply('Server settings not found. Please set them up using /setup.');
				return;
				}catch (error){
						try{
								interaction.reply("If you've run the set up command and still see this please contact support.")
						}catch{
								intrraction.followUp("If you've run the set up command and still see this please contact support.")
						}
						}
				}

		if (serverSettings.premium === "yes"){
			interaction.reply(`${text}`)
		} else {
			interaction.reply(`This command is reserved for premium servers only.`)
		}
	},
};