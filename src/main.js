import dotenv from 'dotenv'
dotenv.config()

import loadEvents from "./handlers/eventHandler.js";
import loadCommands from './handlers/slashCommands.js';

const TOKEN = process.env.TOKEN;

import { Client, GatewayIntentBits, Collection } from "discord.js";
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

client.login(TOKEN).then(() => {
  loadEvents(client);
  loadCommands(client);
});