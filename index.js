require("dotenv").config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { stringify } = require('csv-stringify/sync');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const CSV_PATH = path.join(__dirname, 'tokens.csv');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ─── Register slash command ───────────────────────────────────────────────────
async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('verify')
      .setDescription('Verify yourself with your token from your acceptance email')
      .addStringOption(opt =>
        opt.setName('token')
          .setDescription('Your unique verification token')
          .setRequired(true)
      )
  ].map(c => c.toJSON());

  const rest = new REST({ version: '10' }).setToken(TOKEN);
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
  console.log('✅ Slash command registered');
}

// ─── Read tokens CSV ──────────────────────────────────────────────────────────
function readTokens() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', data => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// ─── Write tokens CSV ─────────────────────────────────────────────────────────
function writeTokens(tokens) {
  const output = stringify(tokens, { header: true, columns: ['token', 'role', 'name', 'used'] });
  fs.writeFileSync(CSV_PATH, output);
}

// ─── Handle /verify command ───────────────────────────────────────────────────
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'verify') return;

  await interaction.deferReply({ ephemeral: true });

  const inputToken = interaction.options.getString('token').trim().toUpperCase();

  let tokens;
  try {
    tokens = await readTokens();
  } catch (err) {
    return interaction.editReply('❌ Could not read the token database. Please contact an organizer.');
  }

  const entry = tokens.find(t => t.token.toUpperCase() === inputToken);

  if (!entry) {
    return interaction.editReply('❌ Invalid token. Please double-check your acceptance email or contact an organizer.');
  }

  if (entry.used === 'true' || entry.used === 'TRUE') {
    return interaction.editReply('❌ This token has already been used. If you think this is a mistake, contact an organizer.');
  }

  // Find the role by name
  const role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === entry.role.toLowerCase());
  if (!role) {
    return interaction.editReply(`❌ Role "${entry.role}" not found on the server. Please contact an organizer.`);
  }

  // Also assign "Verified" role if it exists
  const verifiedRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'verified');

  try {
    await interaction.member.roles.add(role);
    if (verifiedRole) await interaction.member.roles.add(verifiedRole);

    // Set nickname to their name from CSV if provided
    if (entry.name && entry.name.trim()) {
      try {
        await interaction.member.setNickname(entry.name.trim());
      } catch {
        // Nickname setting can fail if user has higher perms, ignore
      }
    }

    // Mark token as used
    entry.used = 'true';
    writeTokens(tokens);

    await interaction.editReply(
      `✅ You've been verified as a **${entry.role}**${entry.name ? `, ${entry.name}` : ''}! Welcome to MasseyHacks XII 🎉`
    );
  } catch (err) {
    console.error(err);
    await interaction.editReply('❌ Failed to assign your role. Please contact an organizer.');
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
client.once('ready', () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  registerCommands();
});

client.login(TOKEN);
