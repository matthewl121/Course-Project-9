// Imports
import { GitHubApi } from '../lib/api/Api';  // API import path
import { RM } from '../lib/models/RM';  // class name

// Mock the GitHubApi to simulate API requests during tests without hitting the actual GitHub API
jest.mock('../lib/api/Api');  // mock path

// Test suite for the RM class (Responsive Maintainer)
describe('RM', () => {
  let rm: RM;  // Instance of the Responsive Maintainer class

  // Set up a new RM instance before each test
  beforeEach(async () => {
    rm = new RM('https://github.com/owner/repo');
    await rm.init();
  });

  // Test case for a repository with mostly unresolved issues and PRs
  test('should return a score < 0.5 for repo with majority of issues open and unresolved', async () => {
    // Mock the API response for issues, pull requests, and commits
    (GitHubApi.prototype.get as jest.Mock).mockImplementation((endpoint: string) => {
      if (endpoint.includes('/issues')) {
        return [
          { state: 'open', created_at: '2023-08-01T00:00:00Z', closed_at: null, user: { type: 'User' } },
          { state: 'open', created_at: '2023-07-01T00:00:00Z', closed_at: null, user: { type: 'User' } },
        ];
      } else if (endpoint.includes('/pulls')) {
        return [
          { state: 'open', created_at: '2023-08-15T00:00:00Z', closed_at: null, user: { type: 'User' } },
        ];
      } else if (endpoint.includes('/commits')) {
        return Array(10).fill({ sha: 'mocksha', commit: { committer: { date: '2023-08-01T00:00:00Z' } } });
      }
      return [];
    });

    // Initialize and calculate the score using getScore()
    const score = rm.getScore();
    expect(score).toBeLessThan(0.5);
  });

  // Test case for repositories with no issues or pull requests
  test('should handle repositories with no issues or pull requests', async () => {
    // Mock the API response for commits only
    (GitHubApi.prototype.get as jest.Mock).mockImplementation((endpoint: string) => {
      if (endpoint.includes('/commits')) {
        return Array(5).fill({ sha: 'mocksha', commit: { committer: { date: '2023-09-01T00:00:00Z' } } });
      }
      return [];
    });

    // Initialize and calculate the score using getScore()
    const score = rm.getScore();
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
  
  // Test case for a repository with quickly addressed issues and PRs
  test('should return a score >= 0.5 for repo with quickly addressed issues', async () => {
    // Mock the API response for issues, pull requests, and commits
    (GitHubApi.prototype.get as jest.Mock).mockImplementation((endpoint: string) => {
      if (endpoint.includes('/issues')) {
        return [
          { state: 'closed', created_at: '2023-09-01T00:00:00Z', closed_at: '2023-09-02T00:00:00Z', user: { type: 'User' } },
          { state: 'closed', created_at: '2023-09-01T00:00:00Z', closed_at: '2023-09-03T00:00:00Z', user: { type: 'User' } },
        ];
      } else if (endpoint.includes('/pulls')) {
        return [
          { state: 'closed', created_at: '2023-09-01T00:00:00Z', closed_at: '2023-09-02T00:00:00Z', user: { type: 'User' } },
        ];
      } else if (endpoint.includes('/commits')) {
        return Array(50).fill({ sha: 'mocksha', commit: { committer: { date: '2023-09-01T00:00:00Z' } } });
      }
      return [];
    });

    // Initialize and calculate the score using getScore()
    const score = rm.getScore();
    expect(score).toBeGreaterThanOrEqual(0.5);
  });

  // Test case for handling simpler, specific error
  test('should handle missing repository data error gracefully', async () => {
    // Mock the API to return an empty response for repo data
    (GitHubApi.prototype.get as jest.Mock).mockImplementation((endpoint: string) => {
      if (endpoint.includes('/repos')) {
        throw new Error('Repository not found');
      }
      return [];
    });

    // Expect the calculation to handle the error
    const score = rm.getScore();
    expect(score).toBe(0);
  });
});
