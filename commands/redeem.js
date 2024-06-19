// Example of a pruning (bulk delete) command for a bot
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('redeem')
		.setDescription('Reedeem your servers premium')

	async execute(interaction) {

	},
};