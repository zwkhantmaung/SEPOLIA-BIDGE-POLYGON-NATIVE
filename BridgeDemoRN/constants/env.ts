/**
 * Environment config from .env (loaded via app.config.js extra).
 * Set CONTRACT_ADDRESS, MINT_AMOUNT, LOCK_BURN_AMOUNT, RPC_URL in .env.
 */
import Constants from 'expo-constants';

const extra = (Constants.expoConfig as { extra?: Record<string, string> })?.extra ?? {};

export const contractAddress = extra.CONTRACT_ADDRESS ?? '';
export const rpcUrl = extra.RPC_URL ?? undefined;

const mint = parseInt(extra.MINT_AMOUNT ?? '1000000', 10);
const lockBurn = parseInt(extra.LOCK_BURN_AMOUNT ?? '10000', 10);

export const mintAmount = Number.isNaN(mint) ? 1_000_000 : mint;
export const lockAmount = Number.isNaN(lockBurn) ? 10_000 : lockBurn;
export const burnAmount = Number.isNaN(lockBurn) ? 10_000 : lockBurn;
