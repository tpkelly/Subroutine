const { Events } = require('discord.js');
const config = require('../config.js');

const searchWindowInDays = 6;

module.exports = {
  name: Events.MessageCreate,
  execute: async (client, args) => {
    let message = args[0]
    
    // Ignore DMs and threads
    if (!message.inGuild()) {
      return;
    }
    
    var guildConfig = config[message.guild.id];
    
    // Only look at the channels in the Trade/Aid category - this should also ignore threads
    if (message.channel.parent.id != guildConfig.tradeCategory) {
      return;
    }
    
    // Ignore mods and bots
    if (message.author.bot || !message.member.manageable) {
      return;
    }
    
    // Find the last post this member had in the same channel
    var searchWindowMillis = searchWindowInDays * 24 * 60 * 60 * 1000;
    var messages = await message.channel.messages.fetch({ limit: 50, before: message.id })
      .then(messages => messages.filter(m => m.author.id === message.author.id && (message.createdTimestamp - m.createdTimestamp) < searchWindowMillis));
      
    if (!messages.size) {
      return;
    }

    var reply = await message.reply({ content: "Quick reminder: there's a 7-day cooldown for posts in our Trade/Aid channels. Even if you delete your original message, the timer still sets sail ⛵ If you have fresh loot or parts to share, just give it a week or feel free to edit your original message. Fair winds! 🌊⚓" });
    
    await message.delete();
    
    // Get rid of the bot reply to the user after 60 seconds
    setTimeout(() => reply.delete(), 60000);
  }
}