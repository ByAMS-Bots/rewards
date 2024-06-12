const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/user.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('points')
        .setDescription('Get your points or add points')
        .addSubcommand(subcommand =>
            subcommand
                .setName('get')
                .setDescription('Get your current points'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add points to your account')
                .addIntegerOption(option => option.setName('amount').setDescription('Amount of points to add'))),

    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const subcommand = interaction.options.getSubcommand();

        let user = await User.findOne({ userId });

        if (!user) {
            user = new User({ userId, username, lastActive: new Date() });
            await user.save();
        }

        if (subcommand === 'get') {
            await interaction.reply(`${username}, you have ${user.points} points.`);
        } else if (subcommand === 'add') {
            const amount = interaction.options.getInteger('amount');
            if (!amount) {
                return interaction.reply('Please specify the amount of points to add.');
            }
            user.points += amount;
            user.lastActive = new Date();
            await user.save();
            await interaction.reply(`${username}, your points have been updated to ${user.points}.`);
        }
    },
};
