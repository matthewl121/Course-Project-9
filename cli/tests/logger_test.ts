// Imports
import { SystemLogger } from '../lib/utilities/logger';
import * as fs from 'fs';
import * as path from 'path';

describe('SystemLogger', () => {
  // Set up test directories and file paths for log testing
  const testLogDir = path.join(__dirname, 'test_logs');
  const testLogFile = path.join(testLogDir, 'test.log');

  // Clean up environment variables and remove any test files before each test
  beforeEach(() => {
    delete process.env.LOG_FILE;
    delete process.env.LOG_LEVEL;

    // Remove the log file if it exists
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }

    // Remove the log directory if it exists
    if (fs.existsSync(testLogDir)) {
      fs.rmdirSync(testLogDir);
    }
  });

  // Clean up after each test by removing the log files and directories
  afterEach(() => {
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }

    if (fs.existsSync(testLogDir)) {
      fs.rmdirSync(testLogDir);
    }
  });

  // Test: Check if the logger correctly creates the log directory when it does not exist
  test('initialize creates log directory if it does not exist', () => {
    // Set the LOG_FILE environment variable to the test log file
    process.env.LOG_FILE = testLogFile;

    // Initialize the logger
    SystemLogger.initialize();

    // Check that the directory for the log file was created
    expect(fs.existsSync(testLogDir)).toBe(true);
  });

  // Test: Check if an info message is logged when the log level is set to INFO
  test('logs info message when log level is INFO', async () => {
    // Set environment variables for logging
    process.env.LOG_FILE = testLogFile;
    process.env.LOG_LEVEL = '1'; // INFO level

    // Initialize the logger
    SystemLogger.initialize();
    
    const testMessage = 'Test info message';
    SystemLogger.info(testMessage); // Log an info message

    // Delay to ensure the log file is written
    await new Promise<void>(resolve => {
      setTimeout(() => {
        const logContent = fs.readFileSync(testLogFile, 'utf8');
        expect(logContent).toContain('[INFO]: ' + testMessage); // Assert the message was logged
        resolve();
      }, 100); // 100 ms delay to allow async file operations
    });
  });

  // Test: Check if a debug message is logged when the log level is set to DEBUG
  test('logs debug message when log level is DEBUG', async () => {
    process.env.LOG_FILE = testLogFile;
    process.env.LOG_LEVEL = '2'; // DEBUG level

    SystemLogger.initialize();
    
    const testMessage = 'Test debug message';
    SystemLogger.debug(testMessage); // Log a debug message

    // Delay and check if the message is in the log file
    await new Promise<void>(resolve => {
      setTimeout(() => {
        const logContent = fs.readFileSync(testLogFile, 'utf8');
        expect(logContent).toContain('[DEBUG]: ' + testMessage);
        resolve();
      }, 100);
    });
  });

  // Test: Check if an error message is logged regardless of the log level (except OFF)
  test('logs error message at all non-OFF log levels', async () => {
    process.env.LOG_FILE = testLogFile;
    process.env.LOG_LEVEL = '1';  // INFO level

    SystemLogger.initialize();
    
    const testMessage = 'Test error message';
    SystemLogger.error(testMessage); // Log an error message

    // Delay and check the log file for the error message
    await new Promise<void>(resolve => {
      setTimeout(() => {
        const logContent = fs.readFileSync(testLogFile, 'utf8');
        expect(logContent).toContain('[ERROR]: ' + testMessage);
        resolve();
      }, 100);
    });
  });

  // Test: Ensure no messages are logged when log level is OFF
  test('does not log when log level is OFF', async () => {
    process.env.LOG_FILE = testLogFile;
    process.env.LOG_LEVEL = '0'; // OFF level

    SystemLogger.initialize();
    
    // Attempt to log messages at various levels
    SystemLogger.info('This should not be logged');
    SystemLogger.debug('This should not be logged either');
    SystemLogger.error('This should not be logged as well');

    // Delay and check that no log file was created
    await new Promise<void>(resolve => {
      setTimeout(() => {
        expect(fs.existsSync(testLogFile)).toBe(false); // No log file should exist
        resolve();
      }, 100);
    });
  });

  // Test: Handle missing LOG_FILE environment variable gracefully
  test('handles missing LOG_FILE environment variable', () => {
    process.env.LOG_LEVEL = '2'; // DEBUG level

    // Initialize logger without a LOG_FILE
    SystemLogger.initialize();
    
    // Ensure no error is thrown when logging without a LOG_FILE
    expect(() => {
      SystemLogger.info('This should not throw an error');
    }).not.toThrow();
  });

  // Test: Handle invalid LOG_LEVEL environment variable gracefully
  test('handles invalid LOG_LEVEL environment variable', () => {
    process.env.LOG_FILE = testLogFile;
    process.env.LOG_LEVEL = 'invalid'; // Invalid log level

    // Initialize logger with an invalid log level
    SystemLogger.initialize();
    
    // Try to log messages and ensure the log file is not created
    SystemLogger.info('This should not be logged');
    SystemLogger.debug('This should not be logged either');
    expect(fs.existsSync(testLogFile)).toBe(false); // No log file should be created
  });

  // Test: Ensure logger initializes with default OFF log level when LOG_LEVEL is not set
  test('logger initializes with default OFF log level when LOG_LEVEL is not set', () => {
    delete process.env.LOG_LEVEL; // Ensure LOG_LEVEL is not set

    SystemLogger.initialize();

    const consoleSpy = jest.spyOn(console, 'log'); // Spy on console.log

    // Attempt to log messages
    SystemLogger.info('This should not be logged');
    SystemLogger.debug('This should not be logged');
    SystemLogger.error('This should not be logged');

    // Assert that nothing was logged to the console
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore(); // Restore original console.log behavior
  });
});
