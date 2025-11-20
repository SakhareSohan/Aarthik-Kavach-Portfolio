const sdk = require('./kite.sdk');
const tokenRepo = require('../repositories/token.repository');
const Logger = require('../config/logger-config');
const AppError = require('../utils/errors/app-error');
const DEFAULT_KEY = 'default';
async function getLoginURL() {
  Logger.info('[KiteService] getLoginURL() called');
  const url = await sdk.getLoginURL();
  Logger.info('[KiteService] getLoginURL() success');
  return url;
}

function getRedirectUrl(baseUrl) {
  const redirectUrl = `${baseUrl || process.env.BASE_URL || 'http://127.0.0.1:5000'}/api/v1/callback`;
  Logger.info('[KiteService] getRedirectUrl() computed', { redirectUrl });
  return redirectUrl;
}

async function handleCallback(requestToken, opts = {}) {
  const key = opts.key || DEFAULT_KEY;
  Logger.info('[KiteService] handleCallback() called', { key });

  if (!requestToken) {
    Logger.warn('[KiteService] handleCallback() called without requestToken');
    throw new AppError('No request token provided', 400);
  }

  try {
    Logger.info('[KiteService] Generating session via SDK');
    const sessionResp = await sdk.generateSession(requestToken);

    const accessToken = sessionResp && sessionResp.access_token;
    if (!accessToken) {
      Logger.error('[KiteService] No access token returned by Kite');
      throw new AppError('No access token returned by Kite', 500);
    }

    Logger.info('[KiteService] Persisting access token in TokenRepository', { key });
    const saved = await tokenRepo.saveToken(key, {
      accessToken,
      meta: { raw: sessionResp }
    });

    Logger.info('[KiteService] Setting access token on SDK instance', { key });
    sdk.setAccessToken(accessToken);

    Logger.info('[KiteService] handleCallback() completed successfully', { key });
    return saved;
  } catch (err) {
    Logger.error('[KiteService] Error in handleCallback()', {
      key,
      error: err.message
    });
    throw err;
  }
}

async function ensureAccessToken(key = DEFAULT_KEY) {
  Logger.info('[KiteService] ensureAccessToken() called', { key });
  const tokenObj = await tokenRepo.getToken(key);

  if (!tokenObj || !tokenObj.accessToken) {
    Logger.warn('[KiteService] No token found in repository', { key });
    throw new AppError('Please login first (no access token)', 401);
  }

  Logger.info('[KiteService] Setting access token on SDK from repository', { key });
  sdk.setAccessToken(tokenObj.accessToken);

  return tokenObj.accessToken;
}

async function getProfile(key = DEFAULT_KEY) {
  Logger.info('[KiteService] getProfile() called', { key });
  await ensureAccessToken(key);
  const profile = await sdk.getProfile();
  Logger.info('[KiteService] getProfile() success', { key });
  return profile;
}

async function getHoldings(key = DEFAULT_KEY) {
  Logger.info('[KiteService] getHoldings() called', { key });
  await ensureAccessToken(key);
  const holdings = await sdk.getHoldings();
  Logger.info('[KiteService] getHoldings() success', { key });
  return holdings;
}

async function getMFHoldings(key = DEFAULT_KEY) {
  Logger.info('[KiteService] getMFHoldings() called', { key });
  await ensureAccessToken(key);
  const mfHoldings = await sdk.getMFHoldings();
  Logger.info('[KiteService] getMFHoldings() success', { key });
  return mfHoldings;
}

async function getAll(key = DEFAULT_KEY) {
  Logger.info('[KiteService] getAll() called', { key });
  await ensureAccessToken(key);

  const [profile, holdings, mfHoldings] = await Promise.all([
    sdk.getProfile(),
    sdk.getHoldings(),
    sdk.getMFHoldings()
  ]);

  Logger.info('[KiteService] getAll() success', {
    key,
    profileFetched: !!profile,
    holdingsCount: holdings?.length || 0,
    mfHoldingsCount: mfHoldings?.length || 0
  });

  return { profile, equity_holdings: holdings, mf_holdings: mfHoldings };
}

module.exports = {
  getLoginURL,
  getRedirectUrl,
  handleCallback,
  getProfile,
  getHoldings,
  getMFHoldings,
  getAll
};
