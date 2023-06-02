const fs = require("fs");

/**
 * Получает время последнего изменения файл с ценами на предметы
 * @param {string} filePath Путь к файлу
 * @returns {date} Дата последнего изменения файла
 */
function getLastModifiedTime(filePath) {
  const info = fs.statSync(filePath);
  return new Date(info.mtime); 
}

/**
 * Переводит время в timestamp Дискорд-формата
 * @param {date} date Дата изменения файла
 * @returns {string} timestamp Дискорд-формата
 */
function getDiscordTimestamp(date) {
  const timestamp = Math.floor(date.getTime() / 1000);
  return `<t:${timestamp}:D>`;
}

module.exports = {getLastModifiedTime, getDiscordTimestamp};