import { GitHubApi } from '../lib/api/Api';
import { RampUp } from '../lib/models/RampUp';

// Mock the GitHubApi to simulate API requests during tests without hitting the actual GitHub API
jest.mock('../lib/api/Api');

describe('RampUp', () => {
  let rampUpMetric: RampUp;

  // Set up a new RampUp instance before each test
  beforeEach(() => {
    rampUpMetric = new RampUp('https://github.com/owner/repo');
  });

  // Test case: Should return a higher score for good documentation and README link
  test('should return a higher score for good documentation and README link', async () => {
    // Mock the API response for README content and file content
    (GitHubApi.prototype.get as jest.Mock).mockImplementation((endpoint: string) => {
      if (endpoint.includes('/contents/README.md')) {
        return {
          content: Buffer.from('# Project\n## Installation\nInstall instructions here\n## Usage\nUsage examples\n## Documentation\nhttps://docs.example.com').toString('base64')
        };
      }
    });

    // Initialize the metric and check for the score
    await rampUpMetric.init();
    expect(rampUpMetric.score).toBeGreaterThanOrEqual(0.5); // Expect a higher score due to comprehensive documentation
  });

  // Test case: Should handle missing README gracefully
  test('should handle missing README gracefully', async () => {
    // Mock the API response to simulate a missing README file
    (GitHubApi.prototype.get as jest.Mock).mockImplementation((endpoint: string) => {
      if (endpoint.includes('/contents/README.md')) {
        throw new Error('README not found');
      }
    });

    await rampUpMetric.init();
    expect(rampUpMetric.score).toBeLessThan(0.5); // Expect a lower score due to missing README
  });

  // Test case: Should return a lower score for incomplete README documentation
  test('should return a lower score for incomplete README documentation', async () => {
    // Mock the API response for an incomplete README content
    (GitHubApi.prototype.get as jest.Mock).mockImplementation((endpoint: string) => {
      if (endpoint.includes('/contents/README.md')) {
        return {
          content: Buffer.from('# Project\n## Installation\nInstall instructions here').toString('base64')
        };
      }
    });

    await rampUpMetric.init();
    expect(rampUpMetric.score).toBeLessThan(0.5); // Expect a lower score due to incomplete documentation
  });
});
