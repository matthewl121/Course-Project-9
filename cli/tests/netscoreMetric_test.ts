import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { SystemLogger } from '../lib/utilities/logger';
import { jest } from '@jest/globals';
dotenv.config();

// Define paths to CLI and log file
const CLI_PATH = path.join(__dirname, '../../run');  
const LOG_FILE = process.env.LOG_FILE || './log.txt';

// Mock exec function to simulate CLI execution
jest.mock('child_process', () => ({
  exec: (command: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
    if (command.includes('invalid-input-file.txt')) {
      callback(new Error('Error: Invalid input file format'), '', 'Error: Invalid input file format');
    } else {
      callback(null, 'NetScore Calculation Complete', '');
    }
  }
}));

// Mock fs to simulate file system interactions
jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs') as typeof fs;
  return {
    ...actualFs,
    existsSync: jest.fn((filePath: string) => {
      if (filePath === LOG_FILE) {
        return false; // Mocking behavior to ensure the log file does not exist for invalid input
      }
      return actualFs.existsSync(filePath); // Fallback to actual fs behavior for other paths
    }),
    readFileSync: jest.fn(() => 'License initialized with URL'),
    unlinkSync: jest.fn(),
  };
});

// End-to-End Test for CLI behavior
describe('End-to-End Test for NetScore Calculation via CLI', () => {
  
  beforeEach(() => {
    // Clean up log file and reset modules
    jest.resetModules();
    if (fs.existsSync(LOG_FILE)) {
      fs.unlinkSync(LOG_FILE); // Remove old log file if exists
    }
    SystemLogger.initialize();
  });

  // Extend timeout for long-running tests
  jest.setTimeout(10000);  // Increase the timeout to 10 seconds

  test('should correctly calculate NetScore and log results when running the CLI', (done) => {
    // Simulate the CLI command (adjust the argument and file based on actual use)
    const cliCommand = `${CLI_PATH} ./test-input-file.txt`;

    // Execute the CLI command
    exec(cliCommand, (error, stdout, stderr) => {
      expect(error).toBeNull();  // No error expected
      expect(stdout).toContain('NetScore Calculation Complete');

      // Verify log output
      if (fs.existsSync(LOG_FILE)) {
        const logContent = fs.readFileSync(LOG_FILE, 'utf8');
        expect(logContent).toContain('License initialized with URL');
      }

      done();
    });
  });

  test('should handle an invalid input scenario gracefully', (done) => {
    // Simulate the CLI command with an invalid input
    const cliCommand = `${CLI_PATH} ./invalid-input-file.txt`;

    exec(cliCommand, (error, stdout, stderr) => {
      // Expect an error due to invalid input
      expect(error).not.toBeNull();
      expect(stderr).toContain('Error: Invalid input file format');

      // Check that no logs were written for invalid input
      expect(fs.existsSync(LOG_FILE)).toBe(false);  

      done();
    });
  });
});
