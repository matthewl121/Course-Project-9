import { Metric } from './Metric';
import { GitHubApi } from '../api/Api';
import { SystemLogger } from '../utilities/logger';

process.env;
SystemLogger.initialize();

interface FileData {
  path: string;
  size: number;
}

export class RampUp extends Metric {
    private githubApi: GitHubApi;
    private owner: string;
    private repo: string;
    public score: number;

    constructor(URL: string) {
      super(URL);
      this.githubApi = new GitHubApi();
      [this.owner, this.repo] = this.parseGitHubUrl();
      this.score = 0;
    }
  
    private parseGitHubUrl(): [string, string] {
      const parts = this.URL.split('/');
      return [parts[3], parts[4]];
    }
  
    public async init(): Promise<void> {
      try {
          const readmeContent = await this.fetchReadmeContent();
          const hasDocumentationLink = this.checkDocumentationLink(readmeContent);
          this.score = this.calculateRampUpScore(readmeContent, hasDocumentationLink);
      } catch (error) {
          throw error;
      }
    }

    private async fetchReadmeContent(): Promise<string | null> {
        const readmeFileName = 'README.md';
        const endpoint = `/repos/${this.owner}/${this.repo}/contents/${readmeFileName}`;
        
        try {
            const response = await this.githubApi.get(endpoint) as { content: string; encoding: string };

            // Decode the content from base64
            const readmeContent = Buffer.from(response.content, 'base64').toString('utf-8'); // If it's not base64, return it as-is
            return readmeContent; // Return the content of README

        } catch (error) {
            SystemLogger.info(`README.md not found: ${error}`);
            return null; // README does not exist
        }
    }

    private checkDocumentationLink(readmeContent: string | null): boolean {
        if (!readmeContent) return false; // No README, no link

        // Check for a documentation link (you can customize this regex)
        SystemLogger.info(`Checking for documentation link in README:` + /https?:\/\/[^\s]+/.test(readmeContent));
        return /https?:\/\/[^\s]+/.test(readmeContent);
    }

    private calculateRampUpScore(readmeContent: string | null, hasDocumentationLink: boolean): number {
        let score = 0;

        if (readmeContent) {
            const lineCount = readmeContent.split('\n').length;
            score += 0.5; // Increment score for README presence

            // Check for line count and adjust score accordingly
            if (lineCount < 50) {
                score -= 0.4; // Lose half of the score (0.5 / 2 = 0.25)
            }

            if (hasDocumentationLink) score += 0.5; // Increment score for documentation link presence
        }

        return Math.max(0, score); // Ensure score is not negative
    }
}
