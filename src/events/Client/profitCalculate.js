import { EmbedBuilder } from "discord.js";
import profitCalculate from "../../components/profitCalculate/profitCalculate.js";
import inputDataProcess from "../../components/profitCalculate/dataProcess.js";
import { getLastModifiedTime, getDiscordTimestamp, createErrorEmbed } from "../../components/utils.js";

// Анализирует и выводит результат обработки сделки
export default {
  name: "messageCreate",
  once: false,
  async execute(message) {
    if(message.author.bot || message.channelId !== process.env.TRADE_CHANNEL) return;
    const tradePromptString = /<:[^:]+:\d+>(?:\s*<:[^:]+:\d+>)*\s*👉(?:\p{Emoji_Modifier_Base}\p{Emoji_Modifier}*\s*)*(?:<:[^:]+:\d+>(?:\s*<:[^:]+:\d+>)*)*/u;

    // Проверяет тип сообщения, является ли оно обычным или специальным
    if(!tradePromptString.test(message.content)) 
      return;

    const args = message.content.split(/<(.*?)\>/g).filter(Boolean).map(text => text.replace(/\s/g, ""));

    const lastModifiedDate = getLastModifiedTime("newPrices.json");
    const discordTimestamp = getDiscordTimestamp(lastModifiedDate);

    try {
      const { trading: tradeResult, lf: lfResult, itemsBeforeSeparator, itemsAfterSeparator } = inputDataProcess(args);
      const { sumBefore, sumAfter, profit, embedColor, tradeStatus } = profitCalculate(itemsBeforeSeparator, itemsAfterSeparator);
      
      const formattedProfit = Math.abs(profit).toFixed(2);
      let statusString;

      switch(tradeStatus) {
        case -1: {
          statusString = `**Это равноценная сделка** | В этой сделки вы ничего не потеряли и не получили`;
          break;
        };
        case 0: {
          statusString = `**Это невыгодная сделка** | Вы потеряли ${formattedProfit}% из этой сделки`;
          break;
        };
        case 1: {
          statusString = `**Это выгодная сделка** | Вы получили ${formattedProfit}% из этой сделки`;
          break;
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
      const errorEmbed = createErrorEmbed(error.message);

      console.log("Error: ", error.message);
      const sentMessage = await message.reply({embeds: [errorEmbed]});

      setTimeout(() => {
        sentMessage.delete();
      }, 5000);
    }
  }
};