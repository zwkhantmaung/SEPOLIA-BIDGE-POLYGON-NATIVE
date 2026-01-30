/**
 * Expo reads this file at start/build time (npm start, run:ios, etc.).
 * Values in "extra" are available at runtime via Constants.expoConfig.extra.
 * Used by: constants/env.ts → app/index.tsx (mintAmount, lockAmount, burnAmount, contractAddress).
 */
require('dotenv').config();

const appJson = require('./app.json');

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS ?? '',
      RPC_URL: process.env.RPC_URL ?? '',
      MINT_AMOUNT: process.env.MINT_AMOUNT ?? '1000000',
      LOCK_BURN_AMOUNT: process.env.LOCK_BURN_AMOUNT ?? '10000',
    },
  },
};
