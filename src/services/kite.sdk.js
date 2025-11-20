// src/services/kite.sdk.js
const KiteConnect = require('kiteconnect').KiteConnect;
const Logger = require('../config/logger-config');

const API_KEY = process.env.KITE_API_KEY;
const API_SECRET = process.env.KITE_API_SECRET;

let kiteInstance = null;

function ensureInstance() {
  if (!kiteInstance) {
    if (!API_KEY) {
      Logger.warn('[KiteSDK] KITE_API_KEY missing. Kite SDK calls will fail until configured.');
    } else {
      Logger.info('[KiteSDK] Creating new KiteConnect instance');
    }
    kiteInstance = new KiteConnect({ api_key: API_KEY });
  }
  return kiteInstance;
}

function getLoginURL() {
  const k = ensureInstance();
  Logger.info('[KiteSDK] Generating login URL');
  const url = k.getLoginURL();
  Logger.info('[KiteSDK] Login URL generated');
  return url;
}

async function generateSession(requestToken) {
  const k = ensureInstance();
  if (!API_SECRET) {
    Logger.error('[KiteSDK] KITE_API_SECRET not configured');
    throw new Error('KITE_API_SECRET not configured');
  }
  Logger.info('[KiteSDK] Generating session with requestToken');
  const data = await k.generateSession(requestToken, API_SECRET);
  Logger.info('[KiteSDK] Session generated successfully');
  // yaha pe access token matt banao, cller ko decide karne do kab banana hai, our orchestration service, jisse isko alag kiya hai. seperation of concerns ke liye.
  return data;
}

function setAccessToken(accessToken) {
  const k = ensureInstance();
  if (!accessToken) {
    Logger.error('[KiteSDK] Attempted to set empty access token');
    throw new Error('no access token provided');
  }
  Logger.info('[KiteSDK] Setting access token on Kite instance');
  k.setAccessToken(accessToken);
}

async function getProfile() {
  const k = ensureInstance();
  Logger.info('[KiteSDK] Fetching profile from Kite API');
  const profile = await k.getProfile();
  Logger.info('[KiteSDK] Profile fetched successfully');
  return profile;
}

async function getHoldings() {
  const k = ensureInstance();
  Logger.info('[KiteSDK] Fetching equity holdings from Kite API');
  const holdings = await k.getHoldings();
  Logger.info('[KiteSDK] Equity holdings fetched successfully');
  return holdings;
}

async function getMFHoldings() {
  const k = ensureInstance();
  Logger.info('[KiteSDK] Fetching mutual fund holdings from Kite API');
  const mfHoldings = await k.getMFHoldings();
  Logger.info('[KiteSDK] Mutual fund holdings fetched successfully');
  return mfHoldings;
}

module.exports = {
  getLoginURL,
  generateSession,
  setAccessToken,
  getProfile,
  getHoldings,
  getMFHoldings
};
