#!/usr/bin/env node

/**
 * Flow Account Balance Monitor Script
 *
 * Checks Flow account balances and sends a Discord notification if any fall
 * below the configured threshold. Uses the `notify-discord` helper to send
 * the message so the same code path works locally and in CI.
 */

const { spawn } = require('child_process');

const FLOW_REST_API = 'https://rest-mainnet.onflow.org/v1/accounts';
const FLOW_DECIMALS = 8;
const FLOW_DIVISOR = 10 ** FLOW_DECIMALS;
const DEFAULT_THRESHOLD = 500000000; // 5 FLOW

function parseAddresses(addressesEnv) {
  if (!addressesEnv) {
    throw new Error('FLOW_ADDRESSES environment variable is required');
  }

  const addresses = addressesEnv.split(',').map((entry) => {
    const trimmed = entry.trim();
    if (!trimmed) {
      throw new Error('Empty address entry in FLOW_ADDRESSES');
    }

    if (trimmed.includes(':')) {
      const [label, address] = trimmed.split(':').map((part) => part.trim());
      if (!label) {
        throw new Error(`Missing label in entry: "${trimmed}"`);
      }
      if (!address) {
        throw new Error(`Missing address in entry: "${trimmed}"`);
      }
      return { label, address };
    }

    return { label: trimmed, address: trimmed };
  });

  return addresses;
}

async function fetchBalance(address) {
  const response = await fetch(`${FLOW_REST_API}/${address}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
  if (data.balance === undefined || data.balance === null) {
    throw new Error('Missing balance field in response');
  }

  const rawBalance = Number.parseInt(data.balance, 10);
  return {
    address,
    rawBalance,
    flowBalance: rawBalance / FLOW_DIVISOR,
  };
}

function formatEmbed(lowAccounts, threshold) {
  const thresholdFlow = threshold / FLOW_DIVISOR;
  const accountFields = lowAccounts.map((account) => ({
    name: `💰 ${account.label}`,
    value: `**${account.flowBalance.toFixed(8)} FLOW**\n[View on Flowscan](https://www.flowscan.io/account/${account.address})\n\`${account.address}\``,
    inline: true,
  }));
  accountFields.push({
    name: '⚠️ Threshold',
    value: `${thresholdFlow.toFixed(2)} FLOW`,
    inline: true,
  });
  return {
    embeds: [
      {
        title: '🚨 Flow Account Balance Alert',
        description: `${lowAccounts.length} account(s) are below the configured threshold of ${thresholdFlow.toFixed(
          2
        )} FLOW`,
        color: 15158332,
        fields: accountFields,
        timestamp: new Date().toISOString(),
        footer: { text: 'Flow Reference Wallet Balance Monitor' },
      },
    ],
  };
}

function sendDiscordNotification(payload, webhookUrl) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'node',
      [require.resolve('./notify-discord.js'), '--payload', JSON.stringify(payload)],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, DISCORD_WEBHOOK_URL: webhookUrl },
      }
    );

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        if (stdout.trim()) {
          console.log(stdout.trim());
        }
        resolve();
      } else {
        reject(
          new Error(`notify-discord exited with code ${code}${stderr ? `\n${stderr.trim()}` : ''}`)
        );
      }
    });
  });
}

async function monitorBalances() {
  const { FLOW_ADDRESSES, BALANCE_THRESHOLD, DISCORD_WEBHOOK_URL } = process.env;

  const addresses = parseAddresses(FLOW_ADDRESSES);
  const threshold = Number.parseInt(BALANCE_THRESHOLD || DEFAULT_THRESHOLD, 10);

  console.log(`Monitoring ${addresses.length} account(s) with threshold ${threshold}`);

  const results = [];

  for (const { label, address } of addresses) {
    try {
      const balance = await fetchBalance(address);
      const isLow = balance.rawBalance < threshold;
      console.log(
        `${isLow ? '🚨' : '✅'} ${label} (${address}): ${balance.flowBalance.toFixed(8)} FLOW`
      );
      results.push({ ...balance, label, isLow });
    } catch (error) {
      console.error(`Failed to fetch balance for ${label} (${address}): ${error.message}`);
    }
  }

  const lowAccounts = results.filter((result) => result.isLow);

  if (lowAccounts.length === 0) {
    console.log('All accounts above threshold; no notification sent.');
    return;
  }

  if (!DISCORD_WEBHOOK_URL) {
    throw new Error('DISCORD_WEBHOOK_URL environment variable is required to send alerts');
  }

  const payload = formatEmbed(lowAccounts, threshold);

  await sendDiscordNotification(payload, DISCORD_WEBHOOK_URL);
}

if (require.main === module) {
  monitorBalances().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { monitorBalances };
