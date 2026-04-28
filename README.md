# MasseyHacks XII Verification Bot

A token-based Discord verification bot. Participants type `/verify THEIRTOKEN` and get assigned their role automatically.

## Setup Instructions

### Step 1: Create a Discord Bot
1. Go to https://discord.com/developers/applications
2. Click "New Application" → name it "MasseyHacks Verify"
3. Go to the "Bot" tab → click "Add Bot"
4. Under "Token" click "Reset Token" and copy it → this is your DISCORD_TOKEN
5. Enable "Server Members Intent" under Privileged Gateway Intents
6. Go to OAuth2 → URL Generator → check "bot" and "applications.commands"
7. Check permissions: Manage Roles, Send Messages, Use Slash Commands
8. Copy the generated URL and open it to invite the bot to your server

### Step 2: Get Your IDs
- CLIENT_ID: OAuth2 page → "Client ID"
- GUILD_ID: Right-click your Discord server icon → "Copy Server ID" (enable Developer Mode in Discord settings first)

### Step 3: Install & Run
```bash
# Install dependencies
npm install

# Copy and fill in your credentials
cp .env.example .env
# Edit .env with your DISCORD_TOKEN, CLIENT_ID, GUILD_ID

# Run the bot
npm start
```

### Step 4: Fill in tokens.csv
Edit tokens.csv with your real participant data:
| token | role | name | used |
|-------|------|------|------|
| MXII-ABC123 | Hacker | John Smith | false |
| MXII-DEF456 | Volunteer | Jane Doe | false |

Roles must match your Discord server role names exactly (case-insensitive).
Supported roles: Hacker, Volunteer, Mentor, Judge, Workshop Host, etc.

### Step 5: Send tokens to participants
Email each participant their unique token. They join Discord and type:
```
/verify MXII-ABC123
```

The bot will assign their role and mark the token as used.

## Hosting
To keep the bot running 24/7, host it on:
- **Railway.app** (free tier, easiest)
- **Render.com** (free tier)
- **A VPS** (DigitalOcean, etc.)
