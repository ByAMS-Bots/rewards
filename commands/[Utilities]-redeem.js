const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const Server = require('../models/server-settings'); // Adjust path as needed

module.exports = {
		data: new SlashCommandBuilder()
				.setName('redeem')
				.setDescription('Redeem your server\'s premium'),
		async execute(interaction) {
				const serverId = interaction.guild.id;
				const userId = interaction.user.id;
				const checkUrl = `https://v2.parcelroblox.com/whitelist/check/discord/${userId}`;
				const revokeUrl = `https://v2.parcelroblox.com/whitelist/revoke`;
				const headers = {
						Authorization: process.env.AUTHORIZATION_TOKEN,
						'Content-Type': 'application/json'
				};
				const params = {
						product_id: process.env.PRODUCT_ID
				};

				try {
					 const claimcheck = await Server.findOne({ serverId });
					if (!claimcheck) {
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
					if (claimcheck.premium === "yes") {
						interaction.reply("This server already has premium. Contact support to get it removed.")
					} else{
						const checkResponse = await axios.get(checkUrl, { headers, params });

					//	console.log('Check response data:', checkResponse.data);

						if (checkResponse.data.status === '200') {
								const data = checkResponse.data.data;
						//		console.log('owns_license value:', data.owns_license);

								if (data.owns_license === true) {
										await interaction.reply("Redeemed");

										// Revoke the license
										const revokeBody = {
												product_id: process.env.PRODUCT_ID,
												userid: userId,
												userid_type: 'discord'
										};

										try {
												const revokeResponse = await axios.delete(revokeUrl, { headers, data: revokeBody });
												if (revokeResponse.data.status === '200') {
														console.log(`Premium has been reedeemed in ${interaction.guild.name}`);
												} else {
														console.log(`Failed to revoke license: ${revokeResponse.data.message} in ${interaction.guild.name}`);
												}
											const serverExists = await Server.exists({ serverId });
											if (serverExists) {
													await Server.findOneAndUpdate({ serverId }, { $set: { premium: "yes" } });
											} else {
													const newServer = new Server({ serverId, premium: "yes" });
													await newServer.save();
											}
											
										} catch (revokeError) {
												console.error(`Error revoking license: ${revokeError.message}`);
										}
								} else {
										await interaction.reply("Error claiming premium, please try again later.");
								}
						} else {
								await interaction.reply(`Request failed with status code: ${checkResponse.data.status}`);
								console.log(`Request failed with status code: ${checkResponse.data.status}`);
						}
					}
				} catch (error) {
						console.error(`Error: ${error.message}`);
						await interaction.reply(`Error: ${error.message}`);
				}
		
		},
};
