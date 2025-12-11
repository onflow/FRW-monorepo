#!/usr/bin/env node

/**
 * Simple Discord webhook sender for local testing.
 *
 * Usage:
 *   node scripts/notify-discord.js --message "Hello from FRW"
 *   node scripts/notify-discord.js --webhook https://... --message "Custom URL"
 *   echo '{"embeds":[...]}' | node scripts/notify-discord.js --payload
 *
 * The webhook URL can also be provided via the DISCORD_WEBHOOK_URL env var.
 * If --message is not supplied, the script reads from STDIN.
 * Use --payload to send a raw JSON payload (e.g., embeds).
 */

const https = require('https');
const { URL } = require('url');

let webhookUrl = process.env.DISCORD_WEBHOOK_URL;
let message = null;
let rawPayload = false;

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--webhook') {
    webhookUrl = args[i + 1];
    i += 1;
  } else if (arg === '--message') {
    message = args[i + 1];
    i += 1;
  } else if (arg === '--payload') {
    rawPayload = true;
  }
}

function sendMessage(content) {
  if (!webhookUrl) {
    console.error('Missing Discord webhook URL. Provide via DISCORD_WEBHOOK_URL or --webhook.');
    process.exit(1);
  }

  if (!content || !content.trim()) {
    console.error('Cannot send empty Discord message.');
    process.exit(1);
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(webhookUrl);
  } catch (error) {
    console.error(`Invalid webhook URL: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  let payload;
  if (rawPayload) {
    try {
      JSON.parse(content);
    } catch (error) {
      console.error(
        `Invalid JSON payload provided with --payload flag: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      process.exit(1);
    }
    payload = content;
  } else {
    payload = JSON.stringify({ content: content.trim() });
  }

  const request = https.request(
    {
      method: 'POST',
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    },
    (res) => {
      res.setEncoding('utf8');
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
        res.on('end', () => {
          console.log('Discord notification sent successfully.');
          process.exit(0);
        });
      } else {
        res.on('end', () => {
          console.error(`Discord webhook responded with status ${res.statusCode}.`);
          if (body) {
            console.error(body);
          }
          process.exit(1);
        });
      }
    }
  );

  request.on('error', (error) => {
    console.error(`Failed to send Discord notification: ${error.message}`);
    process.exit(1);
  });

  request.write(payload);
  request.end();
}

if (message) {
  sendMessage(message);
} else if (!process.stdin.isTTY) {
  let buffer = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    buffer += chunk;
  });
  process.stdin.on('end', () => sendMessage(buffer));
} else {
  console.error('No message provided. Use --message or pipe text via stdin.');
  process.exit(1);
}
