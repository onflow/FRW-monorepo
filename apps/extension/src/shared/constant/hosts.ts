/**
 * Backend hosts. Every value is build-time (from .env.<mode> via dotenv-webpack) and falls back to
 * the production host under wallet.flow.com, so a missing variable never points the build at
 * lilico.app or cloudfunctions.net again.
 */

const trimSlash = (url: string) => url.replace(/\/+$/, '');

/** FRW-Server (Go): registration, login, user, account APIs. Was api.lilico.app. */
export const API_GO_SERVER_URL = trimSlash(
  process.env.API_GO_SERVER_URL || 'https://api.wallet.flow.com'
);

/** FRW-web-next (Vercel): payer, config, token lists, avatars, static assets. */
export const API_BASE_URL = trimSlash(
  process.env.API_BASE_URL || 'https://web.api.wallet.flow.com'
);

/** Ported Cloud Functions (moonPaySignature, getProposer, ...). Was the cloudfunctions.net base (FB_FUNCTIONS). */
export const FUNCTIONS_URL = trimSlash(
  process.env.FUNCTIONS_URL || 'https://functions.wallet.flow.com'
);

/** FRW-tx-scanner. Was scanner.lilico.app. Not called by the extension today; kept for parity. */
export const SCANNER_URL = trimSlash(process.env.SCANNER_URL || 'https://scanner.wallet.flow.com');

/** Deep-link / WalletConnect metadata host. Was link.lilico.app, frw-link.lilico.app, fcw-link.lilico.app. */
export const LINK_URL = trimSlash(process.env.LINK_URL || 'https://link.wallet.flow.com');

/**
 * Google Drive backup uses chrome.identity with the manifest oauth2.client_id. The shipped
 * client (prefix 556216024625) belongs to the lilico-334404 project and stops working with it,
 * so the entry points stay hidden unless a build sets GOOGLE_DRIVE_BACKUP_ENABLED="true" with
 * an OAuth client from a project that survives.
 */
export const GOOGLE_DRIVE_BACKUP_ENABLED = process.env.GOOGLE_DRIVE_BACKUP_ENABLED === 'true';
