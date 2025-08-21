# Discord Forum Tag Adder Bot

A Discord bot that allows administrators to easily add tags to forum channels using slash commands.

## Features

- 🏷️ Add multiple tags to forum channels with a single command
- 🛡️ Restricted to users with "Manage Channels" permission
- ✅ Prevents duplicate tags (case-insensitive)
- 📝 Respects Discord's 20-tag limit per forum
- 🎯 Works with current channel or specify a different forum channel

## Setup

### 1. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and create a bot
4. Copy the bot token

### 2. Get Your Client ID

1. In the Discord Developer Portal, go to "General Information"
2. Copy the "Application ID" (this is your CLIENT_ID)

### 3. Configure Environment Variables

Update the `.env` file with your bot credentials:

```env
DISCORD_TOKEN="your_actual_bot_token_here"
CLIENT_ID="your_actual_client_id_here"
```

### 4. Invite the Bot to Your Server

1. In the Discord Developer Portal, go to "OAuth2" > "URL Generator"
2. Select scopes: `bot` and `applications.commands`
3. Select bot permissions: `Manage Channels`
4. Copy the generated URL and invite the bot to your server

### 5. Run the Bot

```bash
npm start
```

## Usage

### Adding Tags to a Forum Channel

Use the `/add-tags` command with a comma-separated list of tags:

```
/add-tags tags: bug, feature, help-wanted
```

This will add three tags: "bug", "feature", and "help-wanted" to the current forum channel.

### Specifying a Different Forum Channel

You can also specify which forum channel to add tags to:

```
/add-tags tags: question, solved channel: #general-forum
```

## Command Details

- **Command**: `/add-tags`
- **Required Permission**: Manage Channels
- **Parameters**:
  - `tags` (required): Comma-separated list of tag names
  - `channel` (optional): The forum channel to add tags to (defaults to current channel)

## Limitations

- Only works with forum channels
- Maximum of 20 tags per forum channel (Discord limitation)
- Duplicate tags are automatically filtered out
- Tags are created as non-moderated by default

## Error Handling

The bot provides helpful error messages for common issues:

- ❌ Insufficient permissions
- ❌ Not a forum channel
- ❌ Duplicate tags
- ❌ Exceeding tag limits
- ❌ Invalid input

## Support

If you encounter any issues, check that:

1. The bot has "Manage Channels" permission
2. You're using the command in or specifying a forum channel
3. Your environment variables are set correctly
4. The bot is online and connected
