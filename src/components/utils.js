import dotenv from 'dotenv';
dotenv.config();

import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder} from "discord.js";
import { client } from "../main.js"; 
import fs from "fs";

/**
 * @param {string} path 
 * @returns {object} Данные файла
 */
const getJSONData = (path) => JSON.parse(fs.readFileSync(path));

/**
 * Получает время последнего изменения файл с ценами на предметы
 * @param {string} filePath Путь к файлу
 * @returns {date} Дата последнего изменения файла
 */
const getLastModifiedTime = (filePath) => new Date(fs.statSync(filePath).mtime);

/**
 * Переводит время в timestamp Дискорд-формата
 * @param {date} date Дата изменения файла
 * @returns {string} timestamp Дискорд-формата
 */
const getDiscordTimestamp = (date) => `<t:${Math.floor(date.getTime() / 1000)}:D>`

/**
 * @param {string} placeHolder Заголовок
 * @param {Array} items Поля списка
 * @param {string} customId Уникальный айди списка
 * @returns {ActionRowBuilder} Экземпляр содержащий список выбора
 */
function createSelectMenuList({ placeHolder, items, customId }) {
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
function createErrorEmbed(description) {
  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("Error")
    .setDescription(description)

  return embed;
}

export { getJSONData, getDiscordTimestamp, getLastModifiedTime, createSelectMenuList, createErrorEmbed };