import { BusFactor } from '../lib/models/BusFactor';
import { GitHubApi } from '../lib/api/Api';

// Mock the GitHubApi to prevent actual API calls during testing.
jest.mock('../lib/api/Api');

describe('BusFactor', () => {
  let busFactor: BusFactor;
  const repoUrl = 'https://github.com/owner/repo';

  beforeEach(() => {
    busFactor = new BusFactor(repoUrl);
  });

  // Test case: Should return a higher score for repositories with many contributors
  test('should return a higher score for repositories with many contributors', async () => {
    // Mock API response to simulate a repository with enough contributors to produce a higher Bus Factor score
    (GitHubApi.prototype.get as jest.Mock).mockResolvedValue([
      { login: 'user1', contributions: 100 },
      { login: 'user2', contributions: 90 },
      { login: 'user3', contributions: 70 },
      { login: 'user4', contributions: 50 },
      { login: 'user5', contributions: 30 },
      { login: 'user6', contributions: 20 },
      { login: 'user7', contributions: 10 },
    ]);

    await busFactor.init();
    expect(busFactor.score).toBeGreaterThanOrEqual(0.5); // Score should be >= 0.5 for more contributors
  });

  // Test case: Should return a lower score for repositories with few contributors
  test('should return a lower score for repositories with few contributors', async () => {
    // Mock API response to simulate a repository with few contributors
    (GitHubApi.prototype.get as jest.Mock).mockResolvedValue([
      { login: 'user1', contributions: 100 },
      { login: 'user2', contributions: 10 },
    ]);

    await busFactor.init();
    expect(busFactor.score).toBeLessThan(0.5); // Lower score for fewer contributors
  });

  // Test case: Handle repositories with only one contributor
  test('should handle repositories with only one contributor', async () => {
    // Mock API response to simulate a repository with one contributor
    (GitHubApi.prototype.get as jest.Mock).mockResolvedValue([
      { login: 'user1', contributions: 100 },
    ]);

    await busFactor.init();
    expect(busFactor.score).toBeLessThan(0.5); // Should be lower since only one contributor
  });

  // Test case: Should handle repositories with no contributors
  test('should handle repositories with no contributors', async () => {
    // Mock API response to simulate a repository with no contributors
    (GitHubApi.prototype.get as jest.Mock).mockResolvedValue([]);

    await busFactor.init();
    expect(busFactor.score).toBe(0); // Should return 0 for no contributors
  });

  // Test case: Should handle API errors gracefully
  test('should handle API errors gracefully', async () => {
    // Mock API to throw an error
    (GitHubApi.prototype.get as jest.Mock).mockRejectedValue(new Error('API Error'));

    await expect(busFactor.init()).rejects.toThrow('API Error');
  });
});