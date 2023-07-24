import  { PermissionFlagsBits } from "discord.js";

export default {
  name: "messageCreate",
  once: false,
  async execute(message) {
    if(!message.content.startsWith("!say") || !message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return;
    message.delete();

    try {
      switch(message.type) {
        // обычное сообщение
        case 0: {
          const messageContent = message.content.slice(4);
          message.channel.send({content: messageContent});
          break;
        }

        // ответ на сообщение
        case 19: {
          const messageContent = message.content.slice(4);
          const repliedMessage = await message.channel.messages.fetch(message.reference?.messageId);
  
          repliedMessage.reply({ content: messageContent })
          break;
        }
      };
    } catch(err) {
      console.log(err.message);
    }
  }
}