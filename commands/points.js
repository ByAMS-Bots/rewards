const { SlashCommandBuilder } = require('@discordjs/builders');
const mongoose = require('mongoose');
const User = require('../models/user.js');

const uri = process.env['MONGO_CONNECT'];

mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

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
        const serverID = interaction.guild.id;
        const subcommand = interaction.options.getSubcommand();

        // Use findOneAndUpdate with upsert: true to ensure atomicity
        let user = await User.findOneAndUpdate(
            { userId, serverID },
            {
                $setOnInsert: {
                    userId,
                    serverID,
                    username,
                    points: 0,
                    lastActive: new Date(),
                }
            },
            { new: true, upsert: true }
        );

        if (subcommand === 'get') {
            await interaction.reply(`${username}, you have ${user.points} points.`);
        } else if (subcommand === 'add') {
            const amount = interaction.options.getInteger('amount');
            if (amount === null) {
                return interaction.reply('Please specify the amount of points to add.');
            }

            user.points += amount;
            user.lastActive = new Date();
            await user.save();
            await interaction.reply(`${username}, your points have been updated to ${user.points}.`);
        }
    },
};
