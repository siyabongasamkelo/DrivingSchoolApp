import winston from "winston";

const logger = winston.createLogger({
  level: "info", // Show 'info' and above (warn, error)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(), // Great for production
  ),
  transports: [
    // 1. Write all errors to a file
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // 2. Write everything to a combined file
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// 3. If we're NOT in production, also log to the console with colors!
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

export default logger;
