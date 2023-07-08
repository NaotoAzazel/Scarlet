const fs = require("fs");
const ColorThief = require('colorthief');
const dataBaseFilePath = "dataBase.json";
const rawData = fs.readFileSync(dataBaseFilePath);
const jsonData = JSON.parse(rawData);

async function getColorNumberFromImageURL(imageURL) {
  const colorArray = await ColorThief.getColor(imageURL);
  const colorNumber = (colorArray[0] * 256 * 256) + (colorArray[1] * 256) + colorArray[2];
  return colorNumber;
}
/**
 * Создает поля для resultEmbed
 * @param {Object} selectedObject 
 * @returns Массив объектов - fields
 */
function createField(selectedObject) {
  return Object.entries(selectedObject).flatMap(([key, value]) => {
    const isInline = String(value).length < 30;

    return {
      name: key,
      value: `\`\`\`${Array.isArray(value) 
        ? value.map((field) => Object.entries(field).map(([fieldKey, fieldValue]) => fieldValue).join(' - ')).join('\n')
        : String(value)
      }\`\`\``,
      inline: isInline,
    };
  })
}

/**
 * Создает embed с информацией на основе входных данных
 * @param {String} targetObject 
 * @param {Array} selectedCategory 
 * @param {Array} history 
 * @returns JSON-embed
 */
async function createResultEmbed(selectedCategory, targetObject, history) {
  const selectedCategoryObject = jsonData[selectedCategory];
  const selectedObject = selectedCategoryObject[targetObject];

  const resultEmbeds = [];
  const embedColor = selectedObject?.image 
    ? await getColorNumberFromImageURL(selectedObject.image) 
    : 15548997;

  switch(selectedCategory) {
    case "Фрукты": {
      const { titleImage, fields, skills } = selectedObject;

      const titleImageEmbed = titleImage
        ? { color: embedColor, image: { url: titleImage || "" } }
        : undefined;

      const infoEmbed = { color: embedColor, fields: createField(fields) };

      const skillsEmbed = {
        color: embedColor,
        title: "Скилы",
        fields: skills.map(skill => ({
          name: `${skill.key} - ${skill.skill}`,
          value: `\`\`\`${skill.info}\`\`\``
        })) || []
      };

      if(titleImageEmbed?.image.url.length) resultEmbeds.push(titleImageEmbed);

      resultEmbeds.push(infoEmbed, skillsEmbed);
      break;
    }

    default: {
      const { fields, image, author } = selectedObject;

      const embed = {
        color: embedColor,
        title: `${targetObject}, ${history.join(" -> ")}`,
        fields: createField(fields),
        image: { url: image || ""  },
        footer: { text: author ? `Автор страницы: ${author}` : ""},
      };

      resultEmbeds.push(embed);
      break;
    }
  };

  return resultEmbeds;
}

module.exports = createResultEmbed;