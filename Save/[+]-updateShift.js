const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, PermissionFlagBits } = require('discord.js');
const Server = require('../models/user.js');
const { Permissions } = require('discord.js');
module.exports = {
	
		data: new SlashCommandBuilder()
				.setName('add')
				.setDescription('Add server-level points')
				.addUserOption(option => option.setName('user').setDescription('The user the points are being added to'))
				.addIntegerOption(option => option.setName('amount').setDescription('Amount of points added'))
,

		async execute(interaction) {
			if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
				await interaction.reply('You are unable to run this command because you don\'t have the required permission: Manage Messages.');
				return;
			}

			const { Permissions } = require('discord.js');
			if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
				await interaction.reply('You are unable to run this command because you don\'t have the required permission: Manage Messages.');
				return;
			}
				const serverId = interaction.guild.id;
				const serverSettings = await Server.findOne({ serverId });

				if (!serverSettings) {
						try {
								await interaction.reply('Server settings not found. Please set them up using /setup.');
						} catch (error) {
								try {
										await interaction.reply("If you've run the setup command and still see this, please contact support.");
								} catch (secondError) {
										await interaction.followUp("If you've run the setup command and still see this, please contact support.");
								}
						}
						return;
				}

				const TT = interaction.options.getString('shift-title') ?? serverSettings.shiftTitle;
				const TTC = interaction.options.getString('shift-start-color') ?? serverSettings.shiftColor;

				if (serverSettings.premium === 'yes') {
						await Server.findOneAndUpdate({ serverId }, { $set: { shiftTitle: TT, shiftColor: TTC } });

						const embed = new MessageEmbed()
								.setColor(serverSettings.defaultColor)
								.setTitle('Premium Shift Settings')
								.setDescription(`I've updated the shift settings to reflect your options listed below.`)
								.setFooter({ text: serverSettings.Branding })
								.addFields(
										{ name: 'Shift Title', value: TT },
										{ name: 'Shift Start Color', value: TTC }
								);

						await interaction.reply({ embeds: [embed] });
				} else {
						await interaction.reply('This command is reserved for premium servers only.');
				}
		},
};
