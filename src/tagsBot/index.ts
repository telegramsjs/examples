import dotenv from "dotenv";
dotenv.config();
import { TelegramClient, Events } from "telegramsjs";
import { Tag, sequelize } from "./models/tags";

const client = new TelegramClient(process.env.TOKEN!);

client.on(Events.Ready, async ({ user }) => {
  await sequelize.sync().then(() => {
    console.log("Database synchronized");
  });

  await user?.setCommands([
    { command: "/start", description: "Welcome message and help" },
    {
      command: "/addtag",
      description: "Add a new tag",
    },
    { command: "/tag", description: "Get a tag description" },
    {
      command: "/edittag",
      description: "Edit a tag",
    },
    {
      command: "/taginfo",
      description: "Get info about a tag",
    },
    { command: "/showtags", description: "Show all available tags" },
    { command: "/removetag", description: "Remove a tag" },
  ]);

  console.log(`Logged in as @${user?.username}`);
});

client.on(Events.Message, async (msg) => {
  if (!msg.content) return;
  if (!msg.entities) return;
  if (msg.entities.botCommand?.[0]?.index !== 0) return;

  const commandName = msg.entities?.botCommand?.[0]!.search;

  if (!commandName) return;

  if (commandName === "/start") {
    await msg.reply("Welcome! Use the commands to manage tags.");
    return;
  } else if (commandName === "/addtag") {
    const [name, ...descriptionParts] = msg.content.split(" ").slice(1);
    const description = descriptionParts.join(" ");

    if (!name || !description) {
      await msg.reply("Usage: /addtag <name> <description>");
      return;
    }

    try {
      const tag = await Tag.create({
        name,
        description,
        username: msg.author?.username ?? msg.author?.firstName ?? "Unknown",
      });

      await msg.reply(`Tag "${tag.get("name")}" has been added.`);
      return;
    } catch (err: any) {
      if (err.name === "SequelizeUniqueConstraintError") {
        await msg.reply("This tag already exists.");
        return;
      } else {
        await msg.reply("An error occurred while adding the tag.");
        return;
      }
    }
  } else if (commandName === "/tag") {
    const name = msg.content.split(" ")[1];

    if (!name) {
      await msg.reply("Usage: /tag <name>");
      return;
    }

    const tag = await Tag.findOne({ where: { name } });

    if (tag) {
      await tag.increment("usageCount");
      await msg.reply(tag.get("description"));
      return;
    }

    await msg.reply(`Tag "${name}" not found.`);
    return;
  } else if (commandName === "/edittag") {
    const [name, ...descriptionParts] = msg.content.split(" ").slice(1);
    const description = descriptionParts.join(" ");

    if (!name || !description) {
      await msg.reply("Usage: /edittag <name> <new description>");
      return;
    }

    const affectedRows = await Tag.update({ description }, { where: { name } });

    if (affectedRows[0] > 0) {
      await msg.reply(`Tag "${name}" has been updated.`);
      return;
    } else {
      await msg.reply(`No tag found with the name "${name}".`);
      return;
    }
  } else if (commandName === "/taginfo") {
    const name = msg.content.split(" ")[1];

    if (!name) {
      await msg.reply("Usage: /taginfo <name>");
      return;
    }

    const tag = await Tag.findOne({ where: { name } });

    if (tag) {
      await msg.reply(`
      Tag "${name}" was created by ${tag.get("username")} and has been used ${tag.get("usageCount")} times.
    `);
      return;
    } else {
      await msg.reply(`Tag "${name}" not found.`);
      return;
    }
  } else if (commandName === "/showtags") {
    const tags = await Tag.findAll({ attributes: ["name"] });

    const tagList =
      tags.map((tag) => tag.get("name")).join(", ") || "No tags available.";
    await msg.reply(`List of tags: ${tagList}`);
    return;
  } else if (commandName === "/removetag") {
    const name = msg.content.split(" ")[1];

    if (!name) {
      await msg.reply("Usage: /removetag <name>");
      return;
    }

    const rowCount = await Tag.destroy({ where: { name } });

    if (rowCount > 0) {
      await msg.reply(`Tag "${name}" has been removed.`);
      return;
    } else {
      await msg.reply(`Tag "${name}" not found.`);
      return;
    }
  }
});

client.login();
