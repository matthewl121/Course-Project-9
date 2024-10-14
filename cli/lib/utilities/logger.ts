//imports
import * as fs from 'fs';
import * as path from 'path';

enum LogLevel {
  OFF = 0,
  INFO = 1,
  DEBUG = 2
}

/**
 * A system-wide logging utility class.
 * This class provides methods for initializing the logger and writing log messages.
 */
export class SystemLogger {
  private static logFile: string | undefined;
  private static logLevel: LogLevel = LogLevel.OFF;

  /**
   * Initializes the logging system.
   * Reads environment variables to set up logging configuration.
   */
  public static initialize(): void {
    this.logFile = process.env.LOG_FILE;
    this.logLevel = this.parseLogLevel(process.env.LOG_LEVEL);

    if (this.logFile) {
      // Ensure the directory exists
      const dir = path.dirname(this.logFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * Parses the log level from environment variable.
   * Defaults to OFF if the value is missing or invalid.
   */
  private static parseLogLevel(level: string | undefined): LogLevel {
    const parsedLevel = parseInt(level || '0');
    return isNaN(parsedLevel) ? LogLevel.OFF : parsedLevel as LogLevel;
  }

  /**
   * Logs an informational message.
   * This will only be logged if the log level is set to INFO or higher.
   * @param message The string message to be logged
   */
  public static info(message: string): void {
    if (this.logLevel >= LogLevel.INFO) {
      this.log('INFO', message);
    }
  }

  /**
   * Logs a debug message.
   * This will only be logged if the log level is set to DEBUG.
   * @param message The string message to be logged
   */
  public static debug(message: string): void {
    if (this.logLevel >= LogLevel.DEBUG) {
      this.log('DEBUG', message);
    }
  }

  /**
   * Logs an error message.
   * This will be logged at all non-OFF log levels.
   * @param message The string message to be logged
   */
  public static error(message: string): void {
    if (this.logLevel > LogLevel.OFF) {
      this.log('ERROR', message);
    }
  }

  /**
   * Internal method to write log messages.
   * @param level The log level of the message
   * @param message The message to be logged
   */
  private static log(level: string, message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [${level}]: ${message}\n`;

    if (this.logFile) {
      fs.appendFile(this.logFile, logMessage, (err) => {
        if (err) console.error(`Failed to write to log file: ${err}`);
      });
    }
  }
}