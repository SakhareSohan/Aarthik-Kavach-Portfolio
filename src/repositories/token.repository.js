const Logger = require('../config/logger-config');
class TokenRepository {
  constructor() {
    this.store = new Map();
  }

  async saveToken(key = 'default', tokenObj = {}) {
    // tokenObj: { accessToken, meta: { createdAt, expiresIn, userId } } yeh example hai, as of now ram use karr rahe hai, aage jake we can add database.
    tokenObj.meta = tokenObj.meta || {};
    tokenObj.meta.createdAt = tokenObj.meta.createdAt || Date.now();
    Logger.info(`[TokenRepository] Saving token for key=${key}`, tokenObj.meta); // logging dala karo
    this.store.set(key, tokenObj);
    return tokenObj;
  }

  async getToken(key = 'default') {
    Logger.info(`[TokenRepository] Fetching token for key=${key} exists=${!!token}`);// logging lagao !!
    return this.store.get(key) || null;
  }

  async deleteToken(key = 'default') {
    Logger.warn(`[TokenRepository] Deleting token for key=${key}`);
    return this.store.delete(key);
  }

  async listKeys() {
    Logger.info(`[TokenRepository] Listing keys`, { keys });// har jagah comment nai karr paunga mei.
    return Array.from(this.store.keys());
  }
}

/**
 * Template for Redis-backed repository (commented, for future)
 *
 * const Redis = require('ioredis');
 * class RedisTokenRepository {
 *   constructor(redisOpts) {
 *     this.client = new Redis(redisOpts);
 *   }
 *   async saveToken(key, tokenObj) {
 *     await this.client.set(`kite:token:${key}`, JSON.stringify(tokenObj));
 *   }
 *   async getToken(key) {
 *     const raw = await this.client.get(`kite:token:${key}`);
 *     return raw ? JSON.parse(raw) : null;
 *   }
 * }
 */

module.exports = new TokenRepository();
