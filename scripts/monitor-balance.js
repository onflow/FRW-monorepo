#!/usr/bin/env node

/**
 * Flow Account Balance Monitor Script
 *
 * Monitors multiple Flow accounts and sends Discord notifications
 * when any account balance falls below the configured threshold.
 *
 * Requires Node.js 18+ for native fetch support (using Node.js 22).
 */

// Configuration
const FLOW_REST_API = 'https://rest-mainnet.onflow.org/v1/accounts';
const FLOW_DECIMALS = 8;
const FLOW_DIVISOR = Math.pow(10, FLOW_DECIMALS); // 100000000
const DEFAULT_THRESHOLD = 500000000; // 5 FLOW

/**
 * Parse addresses from environment variable
 * Supports multiple formats:
 * - Single: "0x1654653399040a61"
 * - Multiple: "0x1654653399040a61,0x2654653399040a62,0x3654653399040a63"
 * - With labels: "wallet1:0x1654653399040a61,wallet2:0x2654653399040a62,treasury:0x3654653399040a63"
 */
function parseAddresses(addressesEnv) {
  if (!addressesEnv) {
    throw new Error('FLOW_ADDRESSES environment variable is required');
  }

  const addresses = addressesEnv.split(',').map((addr) => {
    const trimmed = addr.trim();

    if (trimmed.includes(':')) {
      // Labeled format: "label:address"
      const parts = trimmed.split(':');
      if (parts.length !== 2) {
        throw new Error(
          `Invalid labeled address format: "${trimmed}". Expected format: "label:address"`
        );
      }

      const [label, address] = parts;
      const cleanLabel = label.trim();
      const cleanAddress = address.trim();

      if (!cleanLabel) {
        throw new Error(`Empty label in: "${trimmed}"`);
      }

      if (!cleanAddress) {
        throw new Error(`Empty address in: "${trimmed}"`);
      }

      // Validate address format (Flow addresses should start with 0x)
      if (!cleanAddress.startsWith('0x')) {
        console.warn(`⚠️  Address "${cleanAddress}" doesn't start with 0x - this may cause issues`);
      }

      return { label: cleanLabel, address: cleanAddress };
    } else {
      // Plain address format
      if (!trimmed) {
        throw new Error('Empty address found in FLOW_ADDRESSES');
      }

      if (!trimmed.startsWith('0x')) {
        console.warn(`⚠️  Address "${trimmed}" doesn't start with 0x - this may cause issues`);
      }

      return { label: trimmed, address: trimmed };
    }
  });

  // Check for duplicate labels
  const labels = addresses.map((addr) => addr.label);
  const duplicateLabels = labels.filter((label, index) => labels.indexOf(label) !== index);
  if (duplicateLabels.length > 0) {
    throw new Error(`Duplicate labels found: ${[...new Set(duplicateLabels)].join(', ')}`);
  }

  // Check for duplicate addresses
  const addressList = addresses.map((addr) => addr.address);
  const duplicateAddresses = addressList.filter(
    (address, index) => addressList.indexOf(address) !== index
  );
  if (duplicateAddresses.length > 0) {
    throw new Error(`Duplicate addresses found: ${[...new Set(duplicateAddresses)].join(', ')}`);
  }

  return addresses;
}

/**
 * Fetch account balance from Flow REST API
 */
async function fetchBalance(address) {
  try {
    const url = `${FLOW_REST_API}/${address}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.balance === undefined || data.balance === null) {
      throw new Error(`Invalid response: missing balance field`);
    }

    const rawBalance = parseInt(data.balance);
    const flowBalance = rawBalance / FLOW_DIVISOR;

    return {
      address: data.address,
      rawBalance,
      flowBalance,
      response: data,
    };
  } catch (error) {
    throw new Error(`Failed to fetch balance for ${address}: ${error.message}`);
  }
}

/**
 * Send Discord notification
 */
async function sendDiscordNotification(lowBalanceAccounts, threshold) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('DISCORD_WEBHOOK_URL environment variable is required');
  }

  const thresholdFlow = threshold / FLOW_DIVISOR;

  // Create fields for each low balance account
  const fields = lowBalanceAccounts.flatMap((account) => [
    {
      name: `💰 ${account.label}`,
      value: `**${account.flowBalance.toFixed(8)} FLOW**\n[View on Flowscan](https://www.flowscan.io/account/${account.address})\n\`${account.address}\``,
      inline: true,
    },
  ]);

  // Add threshold field
  fields.push({
    name: '⚠️ Threshold',
    value: `${thresholdFlow.toFixed(2)} FLOW`,
    inline: true,
  });

  const embed = {
    title: '🚨 Flow Account Balance Alert',
    description: `${lowBalanceAccounts.length} account(s) have balance below the configured threshold`,
    color: 15158332, // Red color
    fields,
    timestamp: new Date().toISOString(),
    footer: {
      text: 'Flow Reference Wallet Balance Monitor',
    },
  };

  const payload = {
    embeds: [embed],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 204) {
      return 'Discord notification sent successfully';
    } else {
      const errorText = await response.text();
      throw new Error(`Discord API returned ${response.status}: ${errorText}`);
    }
  } catch (error) {
    throw new Error(`Failed to send Discord notification: ${error.message}`);
  }
}

/**
 * Main monitoring function
 */
async function monitorBalances() {
  try {
    console.log('🚀 Starting Flow balance monitoring...');

    // Parse configuration
    const addresses = parseAddresses(process.env.FLOW_ADDRESSES);
    const threshold = parseInt(process.env.BALANCE_THRESHOLD || DEFAULT_THRESHOLD);
    const thresholdFlow = threshold / FLOW_DIVISOR;

    console.log(`📋 Monitoring ${addresses.length} addresses`);
    console.log(`⚠️  Threshold: ${thresholdFlow} FLOW (${threshold} raw units)`);
    console.log('');

    // Fetch all balances
    const results = [];

    for (const { label, address } of addresses) {
      try {
        console.log(`🔍 Checking ${label} (${address})...`);
        const balance = await fetchBalance(address);

        const result = {
          label,
          address: balance.address,
          rawBalance: balance.rawBalance,
          flowBalance: balance.flowBalance,
          isLow: balance.rawBalance < threshold,
        };

        results.push(result);

        const status = result.isLow ? '🚨 LOW' : '✅ OK';
        console.log(`   ${status} ${result.flowBalance.toFixed(8)} FLOW`);
      } catch (error) {
        console.error(`❌ Error checking ${label} (${address}): ${error.message}`);
        // Continue with other addresses even if one fails
      }
    }

    console.log('');

    // Check for low balances
    const lowBalanceAccounts = results.filter((result) => result.isLow);

    if (lowBalanceAccounts.length > 0) {
      console.log(`🚨 Found ${lowBalanceAccounts.length} account(s) below threshold:`);

      lowBalanceAccounts.forEach((account) => {
        console.log(`   - ${account.label}: ${account.flowBalance.toFixed(8)} FLOW`);
      });

      try {
        const message = await sendDiscordNotification(lowBalanceAccounts, threshold);
        console.log(`✅ ${message}`);
      } catch (error) {
        console.error(`❌ Failed to send Discord notification: ${error.message}`);
        process.exit(1);
      }
    } else {
      console.log('✅ All accounts are above threshold - no notification needed');
    }

    // Summary
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Total accounts: ${results.length}`);
    console.log(`   Above threshold: ${results.length - lowBalanceAccounts.length}`);
    console.log(`   Below threshold: ${lowBalanceAccounts.length}`);
  } catch (error) {
    console.error(`❌ Monitoring failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the monitor
if (require.main === module) {
  monitorBalances();
}

module.exports = { monitorBalances, parseAddresses, fetchBalance };
