const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Server = require('../models/server-settings');
const { Permissions } = require('discord.js');
module.exports = {
	
		data: new SlashCommandBuilder()
				.setName('p-training')
				.setDescription('Edit the premium training details.')
				.addStringOption(option => option.setName('training-title').setDescription('The title shown at the top of training embeds.'))
				.addStringOption(option => option.setName('training-start-color').setDescription('The color used when a training starts.'))
				.addStringOption(option => option.setName('training-locked-color').setDescription('The color used when a training is locked.'))
				.addStringOption(option => option.setName('training-concluded-color').setDescription('The color used when a training/shift is concluded/canceled.'))

	,

		async execute(interaction) {
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

				const TT = interaction.options.getString('training-title') ?? serverSettings.trainingText;
				const TTC = interaction.options.getString('training-start-color') ?? serverSettings.trainingStartColor;
				const TLC = interaction.options.getString('training-locked-color') ?? serverSettings.trainingLockedColor;
				const TCC = interaction.options.getString('training-concluded-color') ?? serverSettings.trainingConcludedColor;

				if (serverSettings.premium === "yes") {
						await Server.findOneAndUpdate({ serverId }, {
								$set: {
										trainingText: TT,
										trainingStartColor: TTC,
										trainingLockedColor: TLC,
										trainingConcludedColor: TCC
								}
						});

						const embed = new MessageEmbed()
								.setColor(serverSettings.defaultColor)
								.setTitle('Premium Training Settings')
								.setDescription(`I've updated the training settings to reflect your options listed below.`)
								.setFooter({ text: serverSettings.Branding })
								.addFields(
										{ name: 'Training Title', value: TT },
										{ name: 'Training Start Color', value: TTC },
										{ name: 'Training Locked Color', value: TLC },
										{ name: 'Training/Shift Concluded/Canceled Color', value: TCC }
								);

						await interaction.reply({ embeds: [embed] });
				} else {
						await interaction.reply('This command is reserved for premium servers only.');
				}
		},
};
