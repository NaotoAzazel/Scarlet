import fs from "fs";
import ascii from "ascii-table";

export default async function loadCommands(client) {
  const table = new ascii().setHeading("Commands", "Status");
  const folders = fs.readdirSync("src/Commands"); 
  let commandsArray = [];

  for(const folder of folders) {
    const files = await fs.promises.readdir(`src/Commands/${folder}`);
    const jsFiles = files.filter((file) => file.endsWith(".js"));

    for(const file of jsFiles) {
      const { default: commandFile } = await import(`../Commands/${folder}/${file}`);

      client.commands.set(commandFile.data.name, commandFile);
      commandsArray.push(commandFile.data.toJSON());

      table.addRow(file, "loaded");
      continue;
    }
  }

  client.application.commands.set(commandsArray);
  return console.log(table.toString())
}