import dotenv from 'dotenv'
dotenv.config();

import { getJSONData, saveJSONData, createLogEmbed } from "../../components/utils.js";
import fs from "fs";

export default {
  name: "interactionCreate",
  async execute(interaction, client) {
    if(!interaction.isButton()) return;

    const allPrices = getJSONData("newPrices.json");
    const buttonName = interaction.customId.split(":")[0];
    const itemName = interaction.customId.split(":")[1];

    // customId выглядит так: [название_кнопки:название_предмета:цена(опционально)]
    switch(buttonName) {
      case "confirm_delete": {
        let itemCategory = "";
        for(const category in allPrices) {
          if (allPrices[category]?.[itemName]) {
            itemCategory = category;
            break;
          }
        }

        if(itemCategory.length) {
          delete allPrices[itemCategory][itemName];
          saveJSONData("newPrices.json", allPrices);
          await interaction.update({ 
            content: `Предмет "${itemName}" успешно удален из файла.`, 
            embeds: [], 
            components: [],
            ephemeral: true
          });
        }

        break;
      }

      case "confirm_update": {
        var newItemPrice = interaction.customId.split(":")[2];
        var oldItemPrice = 0

        let itemCategory = "";
        for(const category in allPrices) {
          if (allPrices[category]?.[itemName]) {
            itemCategory = category, oldItemPrice = allPrices[category][itemName];
            break;
          }
        }

        allPrices[itemCategory][itemName] = newItemPrice;
        const jsonString = JSON.stringify(allPrices, null, 2);
        fs.writeFileSync("newPrices.json", jsonString, "utf-8");

        await interaction.update({
          content: `Цена "${itemName}" была изменена с "${oldItemPrice}" на "${newItemPrice}"`,
          components: [],
          embeds: [],
          ephemeral: true
        });

        break;
      }
    }

    const actionDescriptions = {
      "confirm_delete": {
        title: "Удаление предмета",
        description: `Удалил предмет **${itemName}**`
      },
      "confirm_update": {
        title: "Изменение предмета",
        description: `Изменил **${itemName}** с цены **${oldItemPrice}** на **${newItemPrice}**`
      }
    };

    const logChannelId = process.env.LOG_CHANNEL;
    const sentMessage = await client.channels.cache.get(logChannelId);
    const logEmbed = createLogEmbed(actionDescriptions[buttonName].title, interaction, actionDescriptions[buttonName].description);

    sentMessage.send({ content: `<@${interaction.user.id}>`, embeds: [logEmbed] });
  }
};