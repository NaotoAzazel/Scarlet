import { createErrorEmbed } from "../../components/utils.js";

export default {
  name: "interactionCreate",
  execute(interaction, client) {
    if(!interaction.isChatInputCommand()) return;
    const errorEmbed = createErrorEmbed("Комманда не найдена");

    const command = client.commands.get(interaction.commandName);
    if(!command) {
      interaction.reply({ embeds: [errorEmbed], ephemeral: true })
    }

    command.execute(interaction, client);
  },
};