// ----------------------------------------------------------------------------------//
// Index
// D2D Discord Bot (( v0.1.0 ))
// fiigmnt | January 20, 2022 | Updated:
// ----------------------------------------------------------------------------------//

const { PrismaClient } = require("@prisma/client");
const { Client, Intents } = require("discord.js");

const { DISCORD_TOKEN } = process.env;

const prisma = new PrismaClient();
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

// log startup
client.once("ready", () => {
  console.log("Bot is ready");
});

// load all channel id's from db
const loadServers = async () => {
  const result = await prisma.server.findMany();

  // might need to extract data in a different way from here
  return result;
};

// on bot being added to server
client.on("guildCreate", async (guild) => {
  try {
    console.log(
      `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`
    );
    // 1) create new channel
    const channel = await guild.channels.create("DAO Bridge", {
      type: "GUILD_TEXT",
    });

    if (channel?.id) {
      // 2) grab server and channel id -> store them in db
      const server = await prisma.server.create({
        data: {
          serverId: guild.id,
          serverName: guild.name,
          channelId: channel.id,
        },
      });
    } else {
      throw new Error("Couldn't create channel");
    }
  } catch (error) {
    throw new Error(error);
  }
});

// on message
client.on("messageCreate", async (message) => {
  // grab all channel ids and server names from db
  const servers = await loadServers();
  const channelIds = servers.map((server) => server.channelId);

  // make sure we're not the author and we're only including bot created channels
  const shouldSendMessage =
    channelIds.includes(message.channelId) &&
    message.author.username !== "DAO Bridge";

  if (shouldSendMessage) {
    // store message in db - BREAK OUT

    const sentServer = await prisma.server.findFirst({
      where: {
        serverId: message.guild.id,
      },
    });

    // format server input
    const { id: serverId } = sentServer;

    await prisma.message.create({
      data: {
        messageId: message.id,
        author: message.author.username,
        content: message.content,
        serverId,
      },
    });

    // store chanelId of channel message came from and message author
    const { author, guild, channelId: parentChannelId } = message;

    servers.forEach(async (server) => {
      const { channelId } = server;

      // push message to all channels EXCEPT on recieved from
      if (parentChannelId !== channelId) {
        const channel = client.channels.cache.get(server.channelId);

        // message = author | channelName \n messageContent
        const formattedMessage = `${author.username} | ${guild.name}\n${message.content}`;
        channel.send(formattedMessage);
      }
    });
  }
});

client.login(DISCORD_TOKEN);
