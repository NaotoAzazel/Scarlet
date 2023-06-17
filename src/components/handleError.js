const fs = require('fs');
const itemPriceFilePath = "itemPrice.json";
const rawItemData = fs.readFileSync(itemPriceFilePath);
const items = JSON.parse(rawItemData);

const itemNameRegex = /(?<=\:).+?(?=\:)/g;

/** 
  * Обработчик ошибок
  @param {string} args - Входные данные
  @returns {Array} Массив ошибок, которые записываються с новой строки
*/
function handleErrors(args) {
  const separatorPatterns = new Set(["👉", "👉🏻", "👉🏼", "👉🏽", "👉🏾", "👉🏿"]);
  const wrongWords = new Set(["Items not found: "]);
	
  for(let i = 0; i < args.length; i++) {
    const currentArg = args[i];
    const isInvalid = separatorPatterns.has(currentArg) || !currentArg.match(itemNameRegex) || items[currentArg.match(itemNameRegex)];
    
    if(isInvalid) 
      continue;
    
    wrongWords.add(`<${args[i]}>`);
  }

  return wrongWords;
}

module.exports = handleErrors;