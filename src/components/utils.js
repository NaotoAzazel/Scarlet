import dotenv from 'dotenv';
dotenv.config();

import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder} from "discord.js";
import { client } from "../main.js"; 
import fs from "fs";

/**
 * @param {string} path 
 * @returns {object} Данные файла
 */
export const getJSONData = (path) => JSON.parse(fs.readFileSync(path));

/**
 * @param {string} fileName 
 * @param {object} data 
 * @returns 
 */
export function saveJSONData(fileName, data) {
  try {
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
    return true;
  } catch(err) {
    console.error("Ошибка при сохранении данных в файле", err);
    return false;
  }
}

/**
 * Получает время последнего изменения файл с ценами на предметы
 * @param {string} filePath Путь к файлу
 * @returns {date} Дата последнего изменения файла
 */
export const getLastModifiedTime = (filePath) => new Date(fs.statSync(filePath).mtime);

/**
 * Переводит время в timestamp Дискорд-формата
 * @param {date} date Дата изменения файла
 * @param {string} type Тим отображаемой даты
 * @returns {string} timestamp Дискорд-формата
 */
export const getDiscordTimestamp = (date, type = "D") => `<t:${Math.floor(date.getTime() / 1000)}:${type}>`

/**
 * @param {string} placeHolder Заголовок
 * @param {Array} items Поля списка
 * @param {string} customId Уникальный айди списка
 * @returns {ActionRowBuilder} Экземпляр содержащий список выбора
 */
export function createSelectMenuList({ placeHolder, items, customId }) {
  const createOption = (key, emoji = undefined) => {
    const emojiCache = client.guilds.cache.get(process.env.GUILD_ID).emojis.cache;
    const emojiID = emojiCache.find((val) => val.name === emoji)?.id;

    const optionBuilder = new StringSelectMenuOptionBuilder()
      .setLabel(key)
      .setValue(key)
      
    return emoji ? optionBuilder.setEmoji(emojiID) : optionBuilder;
  }

  const options = items.map((item) => {
    if (typeof item === 'object') {
      const [key, emoji] = Object.entries(item)[0];
      return createOption(key, emoji);
    }

    return createOption(item);
  });

  const list = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeHolder)
    .addOptions(options)
  
  return new ActionRowBuilder().addComponents(list);
};

/**
 * @param {string} description 
 * @returns {object} embed
 */
export function createErrorEmbed(description, title = "Error") {
  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle(title)
    .setDescription(description)

  return embed;
}

/**
 * @param {string} title 
 * @param {interaction} interaction 
 * @param {string} description 
 * @returns {object} embed
 */
export function createLogEmbed(title, interaction, description) {
  const embedColors = {
    "Добавление предмета": "Blue",
    "Удаление предмета": "Red",
    "Изменение предмета": "Yellow"
  };

  const logEmbed = new EmbedBuilder()
    .setTitle(title)
    .setColor(embedColors[title])
    .setDescription(`Ник: ${interaction.user.username}, ID: ${interaction.user.id}\n${description}`)
    .setTimestamp()

  return logEmbed;
}

/**
 * @param {string} a 
 * @param {string} b 
 * @returns {Array}
 */
function calculateLevenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from(Array(m + 1), () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

/**
 * @param {Array} allItems 
 * @param {string} targetItemName 
 * @returns {string} 
 */
export function getClosestItem(allItems, targetItemName) {
  let closestItem = null;
  let minDistance = Infinity;

  for (const category in allItems) {
    for (const item in allItems[category]) {
      const distance = calculateLevenshteinDistance(item, targetItemName);
      if (distance < minDistance) {
        minDistance = distance;
        closestItem = item;
      }
    }
  }

  const threshold = 3;
  if (minDistance > threshold) {
    return null;
  }

  return closestItem;
}
