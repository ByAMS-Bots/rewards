// Example of slash command options and reading option input
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fun-say')
		.setDescription('Get the bot to say something. (Premium and staff only.)')
		.addStringOption(option => option.setName('input').setDescription('Want you want the bot to say')), // user option defined
	async execute(interaction) {
		const value = interaction.options.getString('input'); // reading user option input
		if (value) return interaction.reply(`${value}`); // replying back the value of the options input
		return interaction.reply('No input was provided!');
	},
};