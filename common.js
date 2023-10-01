const { WebhookClient } = require('discord.js');

function sendHook(hookId, hookToken, messageData) {
  var hook = new WebhookClient({ id: hookId, token: hookToken });
  setTimeout(() => hook.destroy(), 10000);
  return hook.send(messageData).catch(err => console.error(err));
}

module.exports = {
  styledEmbed: styledEmbed,
  sendHook: sendHook
};