import { getJSONData } from "../utils.js";
const itemPriceFilePath = "itemPrice.json";
const items = getJSONData(itemPriceFilePath);

const itemNameRegex = /(?<=\:).+?(?=\:)/g;

/** 
  @param {string} args 
  @returns {Array} Массив ошибок
*/
export default function handleErrors(args) {
  const separatorPatterns = new Set(["👉", "👉🏻", "👉🏼", "👉🏽", "👉🏾", "👉🏿"]);
  const wrongWords = ["Не удалось найти цены на предметы: "];
	
  for(let i = 0; i < args.length; i++) {
    const currentArg = args[i];
    const isInvalid = separatorPatterns.has(currentArg) || !currentArg.match(itemNameRegex) || items[currentArg.match(itemNameRegex)];
    
    if(isInvalid) 
      continue;
    
    wrongWords.push(`<${args[i]}>`);
  }

  return wrongWords.join(" ");
}