// Imports
import { Correctness } from '../lib/models/Correctness';
import * as git from 'isomorphic-git';
import * as fs from 'fs';
import * as http from 'isomorphic-git/http/node';
import { GitHubApi } from '../lib/api/Api';

// Mock the git, fs, and GitHubApi modules to simulate file system operations and API calls
jest.mock('isomorphic-git');
jest.mock('fs');
jest.mock('../lib/api/Api');

// Jest test suite for the Correctness class
describe('Correctness', () => {
  let correctness: Correctness;
  const repoUrl = 'https://github.com/owner/repo'; // Example repo URL
  const repoPath = '/home/shay/a/smit4407/Documents/Course-Project-461/test'; // Example path

  // Set up the Correctness instance before each test
  beforeEach(() => {
    correctness = new Correctness(repoUrl);
    
    // Access private member repoPath using 'as any' trick in TypeScript
    (correctness as any).repoPath = repoPath;
  });

  // Test case: Correctness score should be calculated based on the API history
  test('should calculate correctness based on API history', async () => {
    // Mock GitHubApi to return a repository with relevant commit history, forks, issues, and stars
    (GitHubApi.prototype.get as jest.Mock).mockResolvedValue({
      updated_at: '2024-05-01T00:00:00Z',
      forks_count: 1500,
      open_issues_count: 20,
      stargazers_count: 20000,
    });

    // Call the private ApiHistory method using 'as any'
    const score = await (correctness as any).ApiHistory();
    
    // Use toBeCloseTo for floating-point precision instead of toBe
    expect(score).toBeCloseTo(0.65, 2); // Adjusted expected value based on actual method logic
  });

  // Test case: Correctness score should be calculated based on the README contents
  test('should return a Correctness score based on README contents', () => {
    // Mock fs.existsSync to simulate README.md existing in the repo
    (fs.existsSync as jest.Mock).mockImplementation((path: string) => path.includes('README'));
    
    // Mock fs.readFileSync to return README content with an NPM Downloads badge
    (fs.readFileSync as jest.Mock).mockReturnValue('[![NPM Downloads][npm-downloads]][npmtrends-url]');

    
    const score = (correctness as any).Readme();
    expect(score).toBe(0.35); // Assert that the score is correctly calculated for the README
});


  // Test case: Correctness score should return 0 when neither package.json nor README.md is found
  test('should return 0 when no package.json or README.md is found', async () => {
    // Mock fs.existsSync to simulate neither package.json nor README.md file existing
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const score = await (correctness as any).checkCorrectness();
    expect(score).toBe(0); // Assert that the score is 0 when no relevant files are found
  });

  // Test case: Should clone the repository and initialize git
  test('should clone the repository and initialize git', async () => {
    // Mock the git.clone method to simulate cloning the repository
    (git.clone as jest.Mock).mockResolvedValue(undefined);

    await (correctness as any).cloneRepository();
    expect(git.clone).toHaveBeenCalledWith({
      fs,
      http,
      dir: repoPath,
      url: repoUrl,
      depth: 1,
    });
  });

  // Test case: Should clean up the repository after checking correctness
  test('should clean up the repository after checking correctness', async () => {
    // Mock fs.existsSync to simulate the repository directory existing
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    // Mock fs.rmSync to simulate removing the directory
    (fs.rmSync as jest.Mock).mockReturnValue(undefined);

    await (correctness as any).cleanUpRepo(); // Access private method using 'as any'
    expect(fs.rmSync).toHaveBeenCalledWith(repoPath, { recursive: true, force: true });
  });
});
