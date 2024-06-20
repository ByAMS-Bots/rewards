module.exports = {
		name: 'ready',
		once: true,
		execute(client) {
				console.log(`Ready! Logged in as ${client.user.tag}`);

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
								{ activity: 'Cafell RBLX', type: 'PLAYING' },
								{ activity: 'my console for any errors', type: 'WATCHING' },
								{ activity: `Steve's excuse of a playlist`, type: 'LISTENING' },
								{ activity: 'summit beta', type: 'PLAYING' }
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

						// Set interval to update presence every 5 seconds
						setInterval(updatePresence, 5000);
				}, 5000); // Wait 5000 milliseconds (5 seconds) before executing the rotating statuses
		},
};
