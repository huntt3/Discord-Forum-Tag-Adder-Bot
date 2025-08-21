import dotenv from "dotenv";
dotenv.config();

import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";

// Constants for better code maintainability
const COMMAND_NAME = "add-tags";
const COMMAND_DESCRIPTION = "Add tags to a forum channel";
const TAGS_OPTION_NAME = "tags";
const TAGS_OPTION_DESCRIPTION =
  "List of tags separated by commas (e.g., tag1, tag2, tag3)";
const CHANNEL_OPTION_NAME = "channel";
const CHANNEL_OPTION_DESCRIPTION =
  "The forum channel to add tags to (optional, uses current channel if not specified)";

// Create the Discord client with minimal intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // Required for slash commands and guild interactions
  ],
});

// Create the slash command
const addTagsCommand = new SlashCommandBuilder()
  .setName(COMMAND_NAME)
  .setDescription(COMMAND_DESCRIPTION)
  .addStringOption((option) =>
    option
      .setName(TAGS_OPTION_NAME)
      .setDescription(TAGS_OPTION_DESCRIPTION)
      .setRequired(true)
  )
  .addChannelOption((option) =>
    option
      .setName(CHANNEL_OPTION_NAME)
      .setDescription(CHANNEL_OPTION_DESCRIPTION)
      .addChannelTypes(ChannelType.GuildForum)
      .setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

// Register slash commands
async function registerCommands() {
  try {
    console.log("Started refreshing application (/) commands.");

    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: [addTagsCommand.toJSON()],
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("Error registering commands:", error);
  }
}

// Handle interactions
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === COMMAND_NAME) {
    try {
      // Check if user has administrator permissions
      if (
        !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)
      ) {
        await interaction.reply({
          content:
            "❌ You need 'Manage Channels' permission to use this command.",
          ephemeral: true,
        });
        return;
      }

      const tagsInput = interaction.options.getString(TAGS_OPTION_NAME);
      let targetChannel = interaction.options.getChannel(CHANNEL_OPTION_NAME);

      // If no channel specified, use current channel
      if (!targetChannel) {
        targetChannel = interaction.channel;
      }

      // Check if the target channel is a forum channel
      if (targetChannel.type !== ChannelType.GuildForum) {
        await interaction.reply({
          content: "❌ This command can only be used on forum channels.",
          ephemeral: true,
        });
        return;
      }

      // Parse tags from input - split by comma and clean up
      const newTags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .slice(0, 20); // Discord limit is 20 tags per forum

      if (newTags.length === 0) {
        await interaction.reply({
          content: "❌ Please provide at least one valid tag.",
          ephemeral: true,
        });
        return;
      }

      // Get existing tags
      const existingTags = targetChannel.availableTags || [];
      const existingTagNames = existingTags.map((tag) =>
        tag.name.toLowerCase()
      );

      // Filter out duplicate tags (case-insensitive)
      const tagsToAdd = newTags.filter(
        (tagName) => !existingTagNames.includes(tagName.toLowerCase())
      );

      if (tagsToAdd.length === 0) {
        await interaction.reply({
          content: "❌ All provided tags already exist in this forum channel.",
          ephemeral: true,
        });
        return;
      }

      // Check if adding these tags would exceed Discord's limit
      if (existingTags.length + tagsToAdd.length > 20) {
        const maxNewTags = 20 - existingTags.length;
        await interaction.reply({
          content: `❌ Cannot add ${tagsToAdd.length} tags. Forum channels can have a maximum of 20 tags. Currently has ${existingTags.length} tags, can add ${maxNewTags} more.`,
          ephemeral: true,
        });
        return;
      }

      // Create new tag objects
      const newTagObjects = tagsToAdd.map((tagName) => ({
        name: tagName,
        moderated: false,
      }));

      // Update the forum channel with new tags
      const updatedTags = [...existingTags, ...newTagObjects];

      await targetChannel.setAvailableTags(updatedTags);

      // Success response
      const tagList = tagsToAdd.map((tag) => `\`${tag}\``).join(", ");
      await interaction.reply({
        content: `✅ Successfully added ${tagsToAdd.length} tag(s) to ${targetChannel}: ${tagList}`,
        ephemeral: false,
      });
    } catch (error) {
      console.error("Error adding tags:", error);
      await interaction.reply({
        content: "❌ An error occurred while adding tags. Please try again.",
        ephemeral: true,
      });
    }
  }
});

// Bot ready event
client.once("ready", () => {
  console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
  registerCommands();
});

// Error handling
client.on("error", (error) => {
  console.error("Discord client error:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

client.login(process.env.DISCORD_TOKEN);
