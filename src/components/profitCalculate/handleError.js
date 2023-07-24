import { getJSONData } from "../utils.js";
const itemPriceFilePath = "newPrices.json";
const allPrices = getJSONData(itemPriceFilePath);

const itemNameRegex = /(?<=\:).+?(?=\:)/g;

/** 
  @param {string} args 
  @returns {string[]} Массив ошибок
*/
export default function handleErrors(args) {
  const separatorPatterns = new Set(["👉", "👉🏻", "👉🏼", "👉🏽", "👉🏾", "👉🏿"]);
  const wrongWords = ["Не удалось найти цены на предметы: "];
	
  for(let i = 0; i < args.length; i++) {
    const currentArg = args[i];
    let isFind = false;

    for(const category in allPrices) { 
      const isValid = !separatorPatterns.has(currentArg) && allPrices[category].hasOwnProperty(currentArg.match(itemNameRegex));
      if(!isValid) isFind = true;
    }

    if (isFind && !separatorPatterns.has(currentArg)) {
      wrongWords.push(`<${args[i]}>`);
      isFind = false;
    }
  }

  return wrongWords.join(" ");
}