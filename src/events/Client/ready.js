export default {
  name: "ready",
  once: false,
  execute(client) {
    console.log(`${client.user.username} is online`);
  }
};