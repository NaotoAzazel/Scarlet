import dotenv from 'dotenv'
dotenv.config();

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { getJSONData, createErrorEmbed } from "../../components/utils.js";
import fs from "fs";

export default {
  data: new SlashCommandBuilder()
    .setName("edit_item")
    .setDescription("Изменяет данные предмета")
    .addStringOption(option => 
      option.setName("item_name")
        .setDescription("Item name")
        .setRequired(true)
    )
    .addIntegerOption(option => 
      option.setName("new_price")
        .setDescription("Item price")
        .setRequired(true)
        .setMinValue(0)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
      const { options } = interaction;
      const itemName = options.getString("item_name");
      const newItemPrice = options.getInteger("new_price");

      let oldItemPrice = 0, itemCategory = "";
      const allPrices = getJSONData("newPrices.json");
      
      for(const category in allPrices) {
        if(allPrices[category]?.[itemName]) {
          oldItemPrice = allPrices[category][itemName], itemCategory = category;
          break;
        };
      }

      try {
        if(oldItemPrice === 0) throw new Error(`Не удалось найти "${itemName}" в файле`);

        allPrices[itemCategory][itemName] = newItemPrice;
        const jsonString = JSON.stringify(allPrices, null, 2);
  
        fs.writeFileSync("newPrices.json", jsonString, "utf-8");
        
        const logChannelId = process.env.LOG_CHANNEL;
        const sentMessage = await client.channels.cache.get(logChannelId);
      
        const logEmbed = new EmbedBuilder()
          .setTitle("Изменение предмета")
          .setColor("Yellow")
          .setDescription(`Ник: ${interaction.user.username}, ID: ${interaction.user.id}\nИзменил **${itemName}** с цены **${oldItemPrice}** на **${newItemPrice}**`)
          .setTimestamp()

        sentMessage.send({ content: `<@${interaction.user.id}>`, embeds: [logEmbed] });
        await interaction.reply({ content: `Цена предмета "${itemName}" была изменена с "${oldItemPrice}" на "${newItemPrice}"`, ephemeral: true });
      } catch(err) {
        const errorEmbed = createErrorEmbed(err.message);
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
}