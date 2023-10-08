import { getJSONData } from "../utils.js";
const itemPriceFilePath = "newPrices.json";
const allItemsPrice = getJSONData(itemPriceFilePath);

const equalValueBoundary = 20; // заместо 20 можно написать число, которое будет задавать "границу" FAIRY-трейду

/** 
  * @param {Array} Входные данные
  * @returns {object} - Объект, который содержит суму предметов до разделителя и после,
  * процент выгодности
*/
export default function profitCalculate(itemsBeforeSeparator, itemsAfterSeparator) {
  function getPriceSum(items) {
    let sum = 0;

    for(let i = 0; i < items.length; i++) {
      const currentArg = items[i];

      for(const category in allItemsPrice) {
        if(allItemsPrice[category]?.[currentArg]) {
          sum += allItemsPrice[category][currentArg];
        }
      }
    }

    return sum;
  }

  const sumBefore = getPriceSum(itemsBeforeSeparator);
  const sumAfter = getPriceSum(itemsAfterSeparator);

  const profit = ((sumAfter - sumBefore) * 100) / sumAfter;
  const tradeStatus = profit < 0 ? 0 : 1;
  const embedColor = Math.abs(sumBefore - sumAfter) <= equalValueBoundary ? "Blue" : tradeStatus ? "Green" : "Red";

  return { sumBefore, sumAfter, profit, embedColor, tradeStatus };
}
