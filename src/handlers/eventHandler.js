const fs = require("fs");
const ascii = require("ascii-table");

function loadEvents(client) {
  const table = new ascii().setHeading("Events", "Status");
  const folders = fs.readdirSync("src/events"); 
  
  for(const folder of folders) {
    const files = fs.readdirSync(`src/events/${folder}`).filter((file) => file.endsWith(".js"));

    for (const file of files) {
      const event = require(`../events/${folder}/${file}`);
      const eventListener = event.rest ? client.rest : client;
      const eventExecute = (...args) => event.execute(...args, client);
    
      eventListener[event.once ? "once" : "on"](event.name, eventExecute);
      table.addRow(file, 'successfully loaded');
    }
  }

  return console.log(table.toString());
}

module.exports = loadEvents;