const kiteService = require('../services/kite.service');
const Logger = require('../config/logger-config');
const AppError = require('../utils/errors/app-error');

async function home(req, res, next) {
  const cid = req.correlationId;
  Logger.info('[KiteController] GET /api/v1/ (home) hit', { cid });

  try {
    const url = await kiteService.getLoginURL();
    const redirectUrl = kiteService.getRedirectUrl();

    Logger.info('[KiteController] Sending login page', { cid, redirectUrl });

    res.send(`
      <h1>KiteConnect POC</h1>
      <p>Redirect URL: <code>${redirectUrl}</code></p>
      <a href="${url}">Login to Kite</a>
    `);
  } catch (err) {
    Logger.error('[KiteController] Error in home handler', { cid, error: err.message });
    next(err);
  }
}

async function callback(req, res, next) {
  const cid = req.correlationId;
  Logger.info('[KiteController] GET /api/v1/callback hit', {
    cid,
    query: req.query
  });

  try {
    const requestToken = req.query.request_token;
    if (!requestToken) {
      Logger.warn('[KiteController] Missing request_token in callback', { cid });
      throw new AppError('No request_token in query', 400);
    }

    await kiteService.handleCallback(requestToken, { key: 'default' });

    Logger.info('[KiteController] Callback handled successfully', { cid });

    res.send(`
      <h1>Login Successful!</h1>
      <p>Use the /api/v1/profile etc. endpoints to fetch data.</p>
    `);
  } catch (err) {
    Logger.error('[KiteController] Error in callback handler', { cid, error: err.message });
    next(err);
  }
}

async function profile(req, res, next) {
  const cid = req.correlationId;
  Logger.info('[KiteController] GET /api/v1/profile hit', { cid });

  try {
    const data = await kiteService.getProfile('default');
    Logger.info('[KiteController] /profile success', { cid });
    res.json(data);
  } catch (err) {
    Logger.error('[KiteController] /profile failed', { cid, error: err.message });
    next(err);
  }
}

async function holdings(req, res, next) {
  const cid = req.correlationId;
  Logger.info('[KiteController] GET /api/v1/holdings hit', { cid });

  try {
    const data = await kiteService.getHoldings('default');
    Logger.info('[KiteController] /holdings success', {
      cid,
      count: Array.isArray(data) ? data.length : 0
    });
    res.json(data);
  } catch (err) {
    Logger.error('[KiteController] /holdings failed', { cid, error: err.message });
    next(err);
  }
}

async function mfHoldings(req, res, next) {
  const cid = req.correlationId;
  Logger.info('[KiteController] GET /api/v1/mf_holdings hit', { cid });

  try {
    const data = await kiteService.getMFHoldings('default');
    Logger.info('[KiteController] /mf_holdings success', {
      cid,
      count: Array.isArray(data) ? data.length : 0
    });
    res.json(data);
  } catch (err) {
    Logger.error('[KiteController] /mf_holdings failed', { cid, error: err.message });
    next(err);
  }
}

async function all(req, res, next) {
  const cid = req.correlationId;
  Logger.info('[KiteController] GET /api/v1/all hit', { cid });

  try {
    const data = await kiteService.getAll('default');
    Logger.info('[KiteController] /all success', {
      cid,
      hasProfile: !!data?.profile,
      equityCount: Array.isArray(data?.equity_holdings) ? data.equity_holdings.length : 0,
      mfCount: Array.isArray(data?.mf_holdings) ? data.mf_holdings.length : 0
    });
    res.json(data);
  } catch (err) {
    Logger.error('[KiteController] /all failed', { cid, error: err.message });
    next(err);
  }
}

module.exports = {
  home,
  callback,
  profile,
  holdings,
  mfHoldings,
  all
};
