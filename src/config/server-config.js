const path = require('path');
require('dotenv').config();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
const REQUEST_ID_HEADER = process.env.REQUEST_ID_HEADER || 'x-request-id';


module.exports = {
PORT,
NODE_ENV,
BASE_URL,
LOG_LEVEL,
LOG_DIR,
REQUEST_ID_HEADER,
PORT: process.env.PORT,
DB_HOST: process.env.DB_HOST,
DB_DATABASE: process.env.DB_DATABASE,
DB_PORT: process.env.DB_PORT,
DB_PASSWORD: process.env.DB_PASSWORD,
DB_USERNAME: process.env.DB_USERNAME
};