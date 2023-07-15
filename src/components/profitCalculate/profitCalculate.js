import { getJSONData } from "../utils.js";
const itemPriceFilePath = "itemPrice.json";
const items = getJSONData(itemPriceFilePath);

const equalValueBoundary = 20; // заместо 20 можно написать число, которое будет давать "границу" FAIRY-трейду

/** 
  * Считает процент выгодности на основе входных данных  
  * @param {Array} Входные данные
  * @returns {object} Объект, который содержит суму предметов до разделителя и после,
  * процент выгодности
*/
export default function profitCalculate(itemsBeforeSeparator, itemsAfterSeparator) {
  let sumBefore = 0, sumAfter = 0, tradeStatus = 0, embedColor;

  for (let i = 0; i < itemsBeforeSeparator.length || i < itemsAfterSeparator.length; i++) {
    if (i < itemsBeforeSeparator.length) {
      sumBefore += items[itemsBeforeSeparator[i]];
    }
    
    if (i < itemsAfterSeparator.length) {
      sumAfter += items[itemsAfterSeparator[i]];
    }
  }
  
  const profit = ((sumAfter - sumBefore) * 100) / sumAfter;
  profit < 0 ? (tradeStatus = 0, embedColor = "Red") : (tradeStatus = 1, embedColor = "Green");
  
  const biggest = sumBefore > sumAfter ? sumBefore : sumAfter; 
  const smaller = sumBefore < sumAfter ? sumBefore : sumAfter;
  
  if(biggest - smaller <= equalValueBoundary)
    tradeStatus = -1, embedColor = "Blue";
  
  return { sumBefore, sumAfter, profit, embedColor, tradeStatus };
}
