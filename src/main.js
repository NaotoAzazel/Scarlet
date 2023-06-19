require("dotenv").config();

const inputDataProcess = require("./components/profitCalculate/dataProcess.js");
const profitCalculate = require("./components/profitCalculate/profitCalculate.js");
const utils = require("./components/utils");

const TOKEN = process.env.TOKEN;

const items = {
  "torit": {
    "dmg": 50,
    "levelCap": 100,
  },

  "gorot": {
    "dmg": 100,
    "levelCap": 250,
  },
};

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openAI = new OpenAIApi(configuration);

const { Client, EmbedBuilder, GatewayIntentBits, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log("Bot online");
});

// ИИ для администрации
client.on("messageCreate", async(message) => {
  if(!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
  if(!message.content.startsWith(`<@${client.user.id}>`)) return;
  if(message.author.bot) return;
  
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
    console.log(err);
  }
})

// Анализирует и выводит результат обработки сделки
client.on("messageCreate", async(message) => {
  if(message.author.bot || message.channelId !== process.env.TRADE_CHANNEL) return;
  const tradePromptString = /<:[^:]+:\d+>(?:\s*<:[^:]+:\d+>)*\s*👉(?:\p{Emoji_Modifier_Base}\p{Emoji_Modifier}*\s*)*(?:<:[^:]+:\d+>(?:\s*<:[^:]+:\d+>)*)*/u;

  // Проверяет тип сообщения, является ли оно обычным или специальным
  if(!tradePromptString.test(message.content)) 
    return;

  const args = message.content.split(/<(.*?)\>/g).filter(Boolean).map(text => text.replace(/\s/g, ""));

  const lastModifiedDate = utils.getLastModifiedTime("itemPrice.json");
  const discordTimestamp = utils.getDiscordTimestamp(lastModifiedDate);

  try {
    const { trading: tradeResult, lf: lfResult, itemsBeforeSeparator, itemsAfterSeparator } = inputDataProcess(args);
    const { sumBefore, sumAfter, profit, embedColor, tradeStatus } = profitCalculate(itemsBeforeSeparator, itemsAfterSeparator);
    
    const formattedProfit = Math.abs(profit).toFixed(2);
    let statusString;

    switch(tradeStatus) {
      case -1: {
        statusString = `**Это равноценная сделка** | В этой сделки вы ничего не потеряли и не получили`;
      };
      case 0: {
        statusString = `**Это невыгодная сделка** | Вы потеряли ${formattedProfit}% из этой сделки`;
      };
      case 1: {
        statusString = `**Это выгодная сделка** | Вы получили ${formattedProfit}% из этой сделки`;
      }
    }
    
    const replyEmbed = new EmbedBuilder()
      .setDescription(statusString)
      .addFields(
        {name: `Trading: ${sumBefore}`, value: tradeResult, inline: true},
        {name: `LF: ${sumAfter}`, value: lfResult, inline: true},
        {name: `Цены обновлялись: ${discordTimestamp}`, value: "Values aren't exact, follow this advice at your own risk"}
      )
      .setColor(embedColor)

    message.reply({embeds: [replyEmbed]});
  } catch(error) {
    const errorEmbed = new EmbedBuilder()
      .setTitle("Ошибка")
      .setDescription(error.message)
      .setColor("Red")

    const sentMessage = await message.reply({embeds: [errorEmbed]});

    setTimeout(() => {
      sentMessage.delete();
    }, 5000);
  }
})

client.login(TOKEN)