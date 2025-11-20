# AARTHIK KAVACH PROFILE SERVICE

A clean, production-leaning Node.js Express boilerplate featuring:
- Structured routing and controllers
- Centralized configuration and logging (Winston + daily rotate)
- Request correlation IDs for traceability
- Environment-driven server settings
- Example integration with KiteConnect (Zerodha) via a service layer
- In-memory token repository for access tokens
- Error handling middleware with standardized JSON responses

## Quick Start

Prerequisites:
- Node.js 16+ recommended
- A KiteConnect account with API key and secret (if you plan to use the Kite flows)

Setup:
1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies.
3. Start the dev server.

Windows commands:
- Install dependencies:
- Start in dev mode:

Server defaults:
- Port: `5000` (configurable via `.env`)
- Base URL: `http://127.0.0.1:5000`

## Project Structure

- `src/index.js`: Express app bootstrap and middleware registration.
- `src/config/`
- `server-config.js`: Reads `.env` and exposes config (PORT, NODE_ENV, BASE_URL, LOG_LEVEL, LOG_DIR, REQUEST_ID_HEADER).
- `logger-config.js`: Winston logger with JSON format, timestamps, correlation IDs, and daily rotating file transport.
- `src/routes/`
- `index.js`: Attaches `/v1` routes.
- `v1/info.controller.js`: Router for `/api/v1/info` endpoint.
- `v1/kite.router.js`: Router for Kite-related endpoints.
- `src/controllers/`
- `info-controller.js`: Health/info endpoint.
- `kite-controller.js`: Orchestrates Kite login flow and data endpoints.
- `src/services/`
- `kite.service.js`: Orchestration service wrapping SDK calls and token management.
- `kite.sdk.js`: Thin KiteConnect SDK wrapper.
- `index.js`: Service exports.
- `src/repositories/`
- `token.repository.js`: In-memory token store.
- `src/middlewares/`
- `correlation-middleware.js`: Generates per-request correlation ID using AsyncLocalStorage.
- `error-middleware.js`: AppError and generic error handlers.
- `index.js`: Middleware exports.
- `src/utils/`
- `helpers/request.helpers.js`: AsyncLocalStorage and `getCorrelationId` helper.
- `errors/app-error.js`: AppError class (imported as `appError` in error middleware).
- `index.js`: Utility exports.
- `logs/`: Winston daily rotated logs folder (ignored by Git).
- `.env`: Environment configuration (not checked in).
- `.env.example`: Example environment configuration.
- `.gitignore`: Ignores `node_modules/`, `.env`, and `logs/`.
- `package.json`: Scripts and dependencies.

## Configuration (.env)

Key environment variables:
- `PORT`: Server port (default: 5000).
- `NODE_ENV`: `development` | `production` | `test` (default: development).
- `BASE_URL`: Public/base URL used for building redirect URLs (default: `http://127.0.0.1:${PORT}`).
- `LOG_LEVEL`: Winston log level (`error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly`; default: `info`).
- `LOG_DIR`: Directory for log files (default: `<project_root>\logs`).
- `REQUEST_ID_HEADER`: Name of the request ID header if you standardize on one (default: `x-request-id`; note: correlation middleware uses `x-correlation-id` internally).
- `KITE_API_KEY`: Required for KiteConnect integration.
- `KITE_API_SECRET`: Required for session generation in KiteConnect.

## Logging & Correlation IDs

- All logs are JSON with fields: `timestamp`, `level`, `message`, and `correlationId`.
- Correlation ID is propagated via `AsyncLocalStorage`:
- Middleware seeds a UUID per request.
- Logger reads it from the async store and injects it into every log line.
- Rotating file logs: `logs/YYYY-MM-DD-app.log`.
- Console logs are also enabled.

Example log line:

## HTTP API

Base path: `/api/v1`

- `GET /api/v1/info`
  - Returns `200 OK` with JSON `{ success: true, message: 'API is live' }`.

- Kite flow:
  - `GET /api/v1/kite/` — Landing page with the Kite login link.
  - `GET /api/v1/kite/callback?request_token=<token>` — Callback endpoint that exchanges `request_token` for an `access_token` and stores it in the repository.
  - `GET /api/v1/kite/profile` — Fetches user profile (requires stored access token).
  - `GET /api/v1/kite/holdings` — Fetches equity holdings.
  - `GET /api/v1/kite/mf_holdings` — Fetches mutual fund holdings.
  - `GET /api/v1/kite/all` — Fetches profile + both holdings in a single payload.

Notes:
- You must complete the login flow to store the access token before hitting data endpoints.
- If the token is missing, service will respond with `401` and a helpful message.

## KiteConnect Flow Details

1. Home page:
   - Controller: `kite-controller.js` (`home`) builds a login URL via the service and shows a simple HTML page with a link.
2. Redirect URL:
   - `kite.service.js` (`getRedirectUrl`) computes redirect URL using `BASE_URL` (defaults to `http://127.0.0.1:<PORT>`).
   - Ensure your Kite app’s redirect URL matches this environment value.
3. Callback:
   - `kite.service.js` (`handleCallback`) exchanges `request_token` for `access_token` via `kite.sdk.js` (`generateSession`) and persists it in `token.repository.js`.
   - SDK is primed with `access_token` for subsequent API calls.
4. Data endpoints:
   - `ensureAccessToken` loads token from repository, sets it on the SDK, and the SDK performs API calls (`getProfile`, `getHoldings`, `getMFHoldings`).

## Error Handling

- AppError handler: returns `statusCode` and `message` for custom application errors.
- Generic handler: returns `500 Internal Server Error` with a standard JSON body.
- Errors are logged.

## Development Tips

- If you see a log correlation ID as:
  - `"Error while fetching correlation id or no request served yet"` — this is expected for startup logs before any HTTP request is processed.
- For KiteConnect:
  - Ensure both `KITE_API_KEY` and `KITE_API_SECRET` are set.
  - Update your Kite app’s redirect URL to match `BASE_URL + /api/v1/callback`.

## Known Issues / Improvements

- Token repository logging references undefined variables:
  - In `getToken`, `token` is referenced but not defined.
  - In `listKeys`, `keys` is referenced but not defined.
  - These are only in logging calls and won’t break functionality, but should be fixed for accurate logs.

- Config `REQUEST_ID_HEADER` default is `x-request-id`, while correlation middleware uses `x-correlation-id`. Consider unifying these to a single standard header name.

- `req.correlationId` is read in controllers but not explicitly set on `req` by the middleware. Logging is still correct because the logger reads from AsyncLocalStorage. If you need `req.correlationId` in handlers, set it in the middleware.

## Sample Responses

- `GET /api/v1/info`:

- `GET /api/v1/kite/`:
- Simple HTML page with a link to Kite login and the rendered redirect URL.

## Scripts

- `npm run dev`: Start the server with nodemon.

## Dependencies

- express, dotenv, winston, winston-daily-rotate-file
- kiteconnect (KiteConnect SDK)
- http-status-codes, uuid, nodemon

## License

ISC

## Author

Jay Bohra
