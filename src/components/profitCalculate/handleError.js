import { getJSONData } from "../utils.js";
const allPrices = getJSONData("newPrices.json");

const itemNameRegex = /(?<=\:).+?(?=\:)/g;

export default function handleError(args) {
  const separatorPatterns = new Set(["👉", "👉🏻", "👉🏼", "👉🏽", "👉🏾", "👉🏿"]);
  const wrongWords = ["Не удалось найти цены на предметы: "];
  
  for(let i = 0; i < args.length; i++) {
    let isFind = false;
    const currentArg = args[i];

    for(const category in allPrices) {
      if(allPrices[category]?.[currentArg.match(itemNameRegex)]) {
        isFind = true;
        break;
      }
    }

    if(!isFind && !separatorPatterns.has(currentArg)) {
      wrongWords.push(`<${currentArg}>`);
    }
  } 

  return wrongWords.join(" ");
}
