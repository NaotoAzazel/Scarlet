import  { PermissionFlagsBits } from "discord.js";

import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openAI = new OpenAIApi(configuration);

// ИИ для администрации
export default {
  name: "messageCreate",
  once: false,
  async execute(message, client) {
    if(
      !message.member.permissions.has(PermissionFlagsBits.Administrator) || 
      !message.content.startsWith(`<@${client.user.id}>`) || 
      message.author.bot
    ) return;
    
    let conversationLog = [{role: "system", content: "You are a friendly chatbot."}];
    
    conversationLog.push({
      role: "user",
      content: message.content.slice(22) // обрезаем на 22, чтобы убрался пинг(<@botId>) бота в начале сообщения,
    });

    // бот печатает отображение
    await message.channel.sendTyping();

    try {
      const response = await openAI.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: conversationLog,
      });
      
      message.reply(response.data.choices[0].message);
    } catch(err) {
      console.log(err.message);
    }
  }
}