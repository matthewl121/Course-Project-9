import { Metric } from './Metric';
import { GitHubApi } from '../api/Api';
import { SystemLogger } from '../utilities/logger';

interface Contributor {
  login: string;
  contributions: number;
}

export class BusFactor extends Metric {
    private githubApi: GitHubApi;
    private owner: string;
    private repo: string;

    constructor(URL: string) {
      super(URL);
      this.githubApi = new GitHubApi();
      [this.owner, this.repo] = this.parseGitHubUrl();
    }
  
    private parseGitHubUrl(): [string, string] {
      const parts = this.URL.split('/');
      return [parts[3], parts[4]];
    }
  
    async init(): Promise<void> {
      try {
          const contributors = await this.fetchContributors();
          SystemLogger.info(`Contributors: ${contributors.length}`);
          this.score = this.calculateBusFactor(contributors);
          SystemLogger.info(`Bus Factor score initialized to: ${this.score}`);
      } catch (error) {
          SystemLogger.error(`Error initializing Bus Factor: ${error}`);
          throw error;
      }
    }

    //Contributers
    private async fetchContributors(): Promise<Contributor[]> {
        const endpoint = `/repos/${this.owner}/${this.repo}/contributors?per_page=30`;
        const response = await this.githubApi.get(endpoint) as Object [];
        const contributors = response.map((contributor: any) => ({
          login: contributor.login,
          contributions: contributor.contributions
        })) as Contributor[];
        return contributors;
    }


    private calculateBusFactor(contributors: Contributor[]): number {
      if (contributors.length <= 1) {
        return 0;
      }
    
      // Sort contributors by contributions in descending order
      contributors.sort((a, b) => b.contributions - a.contributions);
    
      let totalContributions = 0;
      let criticalContributors = 0;
      let halfTotalContributions = 0;
      let busPeople = 0;
    
      // Calculate total contributions and find critical contributors
      for (let i = 0; i < contributors.length; i++) {
        const curr = contributors[i];
        const next = contributors[i + 1];
    
        totalContributions += curr.contributions;
        criticalContributors++;
    
        if (next && curr.contributions / next.contributions >= 3.8) {
          break;
        }
      }
    
      halfTotalContributions = totalContributions * 0.6;
    
      // Calculate bus factor
      let cumulativeContributions = 0;
      for (const contributor of contributors) {
        cumulativeContributions += contributor.contributions;
        busPeople++;
        if (cumulativeContributions >= halfTotalContributions) {
          break;
        }
      }

      SystemLogger.info(`Critical Contributors: ${criticalContributors}`);
      SystemLogger.info(`Total Contributions: ${totalContributions}`);
      SystemLogger.info(`busPeople: ${busPeople}`);
    
      return 1 - (busPeople / criticalContributors);
    }
}