import { SystemLogger } from './logger';

function main() {
  // Initialize the logger
  SystemLogger.initialize();

  // Log some messages to test
  SystemLogger.info('Application has started');
  console.log('Hello, World!');
  SystemLogger.debug('This is a debug message');
}

main();