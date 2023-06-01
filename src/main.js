
require("dotenv").config();

const inputDataProcess = require("./components/dataProcess");
const profitCalculate = require("./components/profitCalculate");
const utils = require("./components/utils");

const TOKEN = process.env.TOKEN;

// Setup AI library
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});

const openAI = new OpenAIApi(configuration);

// Setup discord library
const { Client, EmbedBuilder, GatewayIntentBits, PermissionFlagsBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// Print a message about the successful bot start
client.on("ready", () => {
  console.log("Bot online")
});

// ИИ для администрации
// client.on("messageCreate", async(message) => {
//   if(!message.member.permissions.has(PermissionFlagsBits.Administrator) && !message.content.startsWith(`<@${client.user.id}>`)) return;
//   if(message.author.bot) return;
  
//   let conversationLog = [{role: "system", content: "You are a friendly chatbot."}];
  
//   // заносим сообщение пользователя в массив
//   conversationLog.push({
//     role: "user",
//     content: message.content.slice(22) // обрезаем на 22, чтобы убрался пинг(<@botId>) бота в начале сообщения,
//   });
  
//   // бот печатает отображение
//   await message.channel.sendTyping();

//   // получение ответа от API-запроса 
//   const response = await openAI.createChatCompletion({
//     model: "davinci",
//     messages: conversationLog,
//   });
  
//   // ответ пользователю
//   message.reply(response.data.choices[0].message);
  
//   // Надеюсь мои комментарии помогут 
//   // другому человеку и дальше поддерживать бота
// })

// Анализирует и выводит результат обработки сделки
client.on("messageCreate", async(message) => {
  if(message.author.bot || message.channelId !== process.env.TRADE_CHANNEL) return;
  const tradePromptString = /<:[^:]+:\d+>(?:\s*<:[^:]+:\d+>)*\s*👉\s*<:[^:]+:\d+>(?:\s*<:[^:]+:\d+>)*/;
  
  // Проверяет тип сообщения, является ли оно обычным или специальным
  if(!tradePromptString.test(message.content)) 
    return;

  const args = message.content.split(/<(.*?)\>/g).filter(text => text !== " ").filter(Boolean);

  // переменные для отображения времени когда изменялись цены на предметы
  const lastModifiedDate = utils.getLastModifiedTime("itemPrice.json");
  const discordTimestamp = utils.getDiscordTimestamp(lastModifiedDate);

  // получение результата анализа строки и подсчет выгодности сделки пользователя
  try {
    const { tradeResult, lfResult, itemsBeforeSeparator, itemsAfterSeparator } = inputDataProcess(args);
    const { sumBefore, sumAfter, profit, embedColor, tradeStatus } = profitCalculate(itemsBeforeSeparator, itemsAfterSeparator);
    
    const replyEmbed = new EmbedBuilder()
      .setAuthor({name: `${tradeStatus} trade | You ${tradeStatus == "FAIR" ? "GET" : tradeStatus} ${Math.abs(profit).toFixed(2)}% from this trade` })
      .addFields(
        {name: `Trading: ${sumBefore}`, value: tradeResult, inline: true},
        {name: `LF: ${sumAfter}`, value: lfResult, inline: true},
        {name: `Item prices were updated: ${discordTimestamp}`, value: " "}
      )
      .setFooter({text: "Values aren't exact, follow this advice at your own risk"})
      .setColor(embedColor)

    message.reply({embeds: [replyEmbed]});
  } catch(error) {
    console.log(error.message);
  }
})

client.login(TOKEN)
