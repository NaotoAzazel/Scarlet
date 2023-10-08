import dotenv from 'dotenv'
dotenv.config();

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } from "discord.js";
import { getJSONData, createErrorEmbed, getClosestItem, createLogEmbed } from "../../components/utils.js";
import fs from "fs";

export default {
  data: new SlashCommandBuilder()
    .setName("edit")
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

      const allPrices = getJSONData("newPrices.json");
      try {
        let oldItemPrice = 0, itemCategory = "";
      
        for(const category in allPrices) {
          if(allPrices[category]?.[itemName]) {
            oldItemPrice = allPrices[category][itemName], itemCategory = category;
            break;
          };
        }

        if(oldItemPrice === 0) {
          const closestItem = getClosestItem(allPrices, itemName);

          if(closestItem) {
            const confirmUpdate = new ButtonBuilder()
              .setCustomId(`confirm_update:${closestItem}:${newItemPrice}`)
              .setLabel("Изменить")
              .setStyle(ButtonStyle.Primary)

            var row = new ActionRowBuilder()
              .addComponents(confirmUpdate)
          
            throw new Error(`Предмет с названием "${itemName}" не найден. Возможно, вы имели в виду "${closestItem}". Если это так то нажмите на кнопку ниже для изменения предмета`)
          } else {
            throw new Error(`Не удалось найти "${itemName}" в файле`);
          }
        } 

        allPrices[itemCategory][itemName] = newItemPrice;
        const jsonString = JSON.stringify(allPrices, null, 2);
  
        fs.writeFileSync("newPrices.json", jsonString, "utf-8");
        
        const logChannelId = process.env.LOG_CHANNEL;
        const sentMessage = await client.channels.cache.get(logChannelId);
        const logEmbed = createLogEmbed(
          "Изменение предмета", 
          interaction, 
          `Изменил **${itemName}** с цены **${oldItemPrice}** на **${newItemPrice}**`
        );

        sentMessage.send({ content: `<@${interaction.user.id}>`, embeds: [logEmbed] });
        await interaction.reply({ content: `Цена "${itemName}" была изменена с "${oldItemPrice}" "${newItemPrice}"`, ephemeral: true });
      } catch(err) {
        const errorEmbed = createErrorEmbed(err.message);
        interaction.reply({ embeds: [errorEmbed], components: row ? [row] : [], ephemeral: true });
      }
    }
}