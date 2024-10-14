//Imports
import { License } from '../lib/models/License';
import * as fs from 'fs';
import * as git from 'isomorphic-git';
import * as http from 'isomorphic-git/http/node';

// Mock the git and fs modules to simulate file system operations and repository cloning
jest.mock('isomorphic-git');
jest.mock('fs');

// Jest test suite for the License class
describe('License', () => {
  let license: License;
  const repoUrl = 'https://github.com/owner/repo'; // Example repo URL
  const repoPath = '/home/shay/a/chen3900/Documents/ECE461/Leo-461-Course-Project/test'; // Example path

  // Set up the License instance before each test
  beforeEach(() => {
    license = new License(repoUrl);
    
    // Access private member repoPath using 'as any' trick in TypeScript
    (license as any).repoPath = repoPath;
  });

  // Test case: License score should be 1 when a compatible license is found in the LICENSE file
  test('should return 1 when a compatible license is found in the LICENSE file', async () => {
    // Mock fs.existsSync to simulate a LICENSE file existing in the repo
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    // Mock fs.readFileSync to return content containing a compatible license (MIT)
    (fs.readFileSync as jest.Mock).mockReturnValue('This project is licensed under the MIT License.');

    // Call the private checkCompatibilityWithLicenses method using 'as any'
    const score = await (license as any).checkCompatibilityWithLicenses(repoUrl); // Pass repoUrl to avoid undefined url issue
    expect(score).toBe(1); // Assert that the score is 1 when a compatible license is found
  });

  // Test case: License score should be 0 when no compatible license is found in the LICENSE file
  test('should return 0 when no compatible license is found in the LICENSE file', async () => {
    // Mock fs.existsSync to simulate a LICENSE file existing in the repo
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    // Mock fs.readFileSync to return content with an incompatible license
    (fs.readFileSync as jest.Mock).mockReturnValue('This project is licensed under the GPL-3.0 License.');

    const score = await (license as any).checkCompatibilityWithLicenses(repoUrl); // Pass repoUrl to avoid undefined url issue
    expect(score).toBe(0); // Assert that the score is 0 when no compatible license is found
  });

  // Test case: License score should be 1 when a compatible license is found in the README file
  test('should return 1 when a compatible license is found in the README file', async () => {
    // Mock fs.existsSync to simulate no LICENSE file but a README file exists
    (fs.existsSync as jest.Mock).mockImplementation((path: string) => path.includes('README'));
    // Mock fs.readFileSync to return content with a compatible license in the README file (LGPLv2.1)
    (fs.readFileSync as jest.Mock).mockReturnValue('This project is licensed under the LGPLv2.1 License.');

    const score = await (license as any).checkCompatibilityWithLicenses(repoUrl); // Pass repoUrl to avoid undefined url issue
    expect(score).toBe(1); // Assert that the score is 1 when a compatible license is found in README
  });

  // Test case: License score should be 0 when neither LICENSE nor README contains a compatible license
  test('should return 0 when neither LICENSE nor README contains a compatible license', async () => {
    // Mock fs.existsSync to simulate both LICENSE and README files existing
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    // Mock fs.readFileSync to return content with an incompatible license in both files
    (fs.readFileSync as jest.Mock).mockReturnValue('This project is licensed under the GPL-3.0 License.');

    const score = await (license as any).checkCompatibilityWithLicenses(repoUrl); // Pass repoUrl to avoid undefined url issue
    expect(score).toBe(0); // Assert that the score is 0 when no compatible license is found in either file
  });

  // Test case: Should clone the repository to the specified path and initialize git
  test('should clone the repository and initialize git', async () => {
    // Mock the git.init and git.clone methods to simulate git operations
    (git.init as jest.Mock).mockResolvedValue(undefined);
    (git.clone as jest.Mock).mockResolvedValue(undefined);

    await (license as any).checkCompatibilityWithLicenses(repoUrl); // Pass repoUrl to avoid undefined url issue
    expect(git.init).toHaveBeenCalledWith({
      fs,
      dir: repoPath,
      defaultBranch: 'main',
    });
    expect(git.clone).toHaveBeenCalledWith({
      fs,
      http,
      dir: repoPath,
      url: repoUrl, 
      depth: 1,
    });
  });

  // Test case: Should clean up the repository after checking compatibility
  test('should clean up the repository after checking compatibility', async () => {
    // Mock fs.existsSync to simulate the repository directory existing
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    // Mock fs.rmSync to simulate removing the directory
    (fs.rmSync as jest.Mock).mockReturnValue(undefined);

    await (license as any).cleanUpRepo(); // Access private method using 'as any'
    expect(fs.rmSync).toHaveBeenCalledWith(repoPath, { recursive: true, force: true });
  });

  // Test case: Should return 0 when the repository does not have a LICENSE or README file
  test('should return 0 when neither LICENSE nor README is found', async () => {
    // Mock fs.existsSync to simulate neither LICENSE nor README file existing
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const score = await (license as any).checkCompatibilityWithLicenses(repoUrl); // Pass repoUrl to avoid undefined url issue
    expect(score).toBe(0); // Assert that the score is 0 when no LICENSE or README is found
  });
});
