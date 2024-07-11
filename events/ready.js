module.exports = {
		name: 'ready',
		once: true,
		execute(client) {
				console.log(`Ready! Logged in as ${client.user.tag}`);
				console.log(`Loaded in Public Beta V0.01.01.02 | Server Support: Off | Admin Commands: Off`);

				// Set initial static presence
				client.user.setPresence({
						activities: [{
								name: 'Starting up...',
								type: 'PLAYING'
						}]
				});

				// Wait for 5 seconds before switching to rotating statuses
				setTimeout(() => {
						// Array of statuses to rotate through
						const statuses = [
								{ activity: 'how to scam 101 by Sophia', type: 'WATCHING' },
								{ activity: 'Steve Sleep', type: 'WATCHING' },
								{ activity: `Steve's excuse of a playlist`, type: 'LISTENING' },
								{ activity: 'with databse values', type: 'PLAYING' }
								// Add more statuses as needed
						];

						let currentStatusIndex = 0;

						// Function to update the bot's presence
						const updatePresence = () => {
								client.user.setPresence({
										activities: [{
												name: statuses[currentStatusIndex].activity,
												type: statuses[currentStatusIndex].type
										}],
										status: 'idle' // Set the bot status to idle
								});

								currentStatusIndex = (currentStatusIndex + 1) % statuses.length; // Move to the next status
						};

						// Initial call to set the presence
						updatePresence();

						// Get the channel by ID
						const channel = client.channels.cache.get('1226176947181195345');

						// Set interval to update presence and send typing every 5 seconds
						setInterval(() => {
								updatePresence();

								if (channel) {
										// Send typing indicator to the channel
										channel.sendTyping();
								} else {
										console.log('Channel not found.');
								}
						}, 5000);
				}, 5000); // Wait 5000 milliseconds (5 seconds) before executing the rotating statuses
		},
};
