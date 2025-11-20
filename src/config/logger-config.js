const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const { requestHelper } = require("../utils");
const { getCorrelationId } = requestHelper || {};

const addCorrelationId = winston.format((info) => {
  try {
    info.correlationId = typeof getCorrelationId === "function"
      ? getCorrelationId()
      : "unknown";
  } catch (err) {
    info.correlationId = "unknown";
  }
  return info;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "MM-DD-YYYY HH:mm:ss" }),
    addCorrelationId(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({ handleExceptions: true }),
    new DailyRotateFile({
      filename: "logs/%DATE%-app.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      handleExceptions: true,
    })
  ],
  exitOnError: false,
});

module.exports = logger;
