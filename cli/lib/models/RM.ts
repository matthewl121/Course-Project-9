//Imports
import { Metric } from './Metric';
import { GitHubApi } from '../api/Api';
import { SystemLogger } from '../utilities/logger';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
SystemLogger.initialize();

interface RepoData {
    [key: string]: any; // Optional: Allow additional properties in the response
}

interface IssueOrPR {
    created_at: string;
    closed_at: string | null;
    user: {
        type: string; // Check for 'Bot' to exclude bot PRs
    };
}

export class RM extends Metric {
    private githubApi: GitHubApi;
    private owner: string;

    constructor(URL: string) {
        SystemLogger.info(`RM initialized with URL: ${URL}`);
        super(URL);
        try {
            this.githubApi = new GitHubApi();
            if (!this.githubApi) {
                SystemLogger.error('API Error');
                throw new Error('API Error');
            }

            this.score = 0;
            [this.owner, this.URL] = this.parseGitHubUrl();
        } catch (error) {
            SystemLogger.error('Error initializing RM');
            throw error;
        }
    }

    private parseGitHubUrl(): [string, string] {
        const parts = this.URL.split('/');
        return [parts[3], parts[4]];
    }

    public async init(): Promise<void> {
        this.score = await this.calculateScore();
        SystemLogger.info(`RM score initialized to: ${this.score}`);
    }

    /**
     * Fetch repository data from GitHub API and calculate the RM score.
     */
    async calculateScore(): Promise<number> {
        try {
            const endpoint = `/repos/${this.owner}/${this.URL}`;
            const repoData = await this.githubApi.get(endpoint) as unknown as RepoData;

            // Fetch open issues and PRs using the new fetchIssueData function
            const { openIssues, filteredPRs } = await this.fetchIssueData();
            
            const lastCommitDate = await this.getLastCommitDate(repoData);

            // Calculate individual scores based on chosen metrics
            const issueAgeScore = this.calculateIssueOrPRAgeScore(openIssues);
            const prAgeScore = this.calculateIssueOrPRAgeScore(filteredPRs);
            const recentCommitScore = this.calculateRecencyScore(lastCommitDate);

            // Average out the scores with a weighted distribution
            const output = (issueAgeScore * 0.4 + prAgeScore * 0.4 + recentCommitScore * 0.2);

            SystemLogger.info(`RM score: ${output}`);
            return output;
        } catch (error) {
            SystemLogger.error('Error calculating RM score');
            return 0;
        }
    }

    /**
     * Fetch open issues and filtered PRs data from the repository.
     * @returns {Promise<{openIssues: IssueOrPR[], filteredPRs: IssueOrPR[]}>}
     */
    private async fetchIssueData(): Promise<{ openIssues: IssueOrPR[], filteredPRs: IssueOrPR[] }> {
        try {
            // Fetch open issues data
            const issuesEndpoint = `/repos/${this.owner}/${this.URL}/issues?state=open&per_page=100`;
            const openIssues = await this.githubApi.get(issuesEndpoint) as IssueOrPR[];

            // Fetch open pull requests data
            const prsEndpoint = `/repos/${this.owner}/${this.URL}/pulls?state=open&per_page=100`;
            const openPRs = await this.githubApi.get(prsEndpoint) as IssueOrPR[];

            // Filter out bot-created PRs
            const filteredPRs = openPRs.filter(pr => pr.user.type !== 'Bot');

            return { openIssues, filteredPRs };
        } catch (error) {
            SystemLogger.error('Error fetching issue and PR data');
            return { openIssues: [], filteredPRs: [] };
        }
    }

    /**
     * Calculate a score based on the average age of open issues or PRs.
     * @param {IssueOrPR[]} items - List of open issues or PRs.
     * @returns {number} - Age score between 0 and 1.
     */
    private calculateIssueOrPRAgeScore(items: IssueOrPR[]): number {
        if (items.length === 0) {
            return 1; // If no open items, maximum score
        }

        const today = new Date().getTime();
        let totalAgeInDays = 0;

        items.forEach(item => {
            const createdDate = new Date(item.created_at).getTime();
            const ageInDays = (today - createdDate) / (1000 * 60 * 60 * 24);
            totalAgeInDays += ageInDays;
        });

        const averageAgeInDays = totalAgeInDays / items.length;

        // Normalize the score: as average age increases, score decreases
        return Math.max(1 - averageAgeInDays / 365, 0);
    }

    /**
     * Fetch the date of the last commit from the repository.
     * @param {any} repoData - Repository data from the GitHub API.
     * @returns {Promise<Date>} - Date of the last commit.
     */
    private async getLastCommitDate(repoData: any): Promise<Date> {
        try {
            const commits = await this.githubApi.get(`/repos/${repoData.full_name}/commits`) as unknown as RepoData;
            return new Date(commits[0].commit.committer.date);
        } catch (error) {
            SystemLogger.error('Error fetching last commit date');
            throw error;
        }
    }

    /**
     * Calculate a score based on the recency of the last commit.
     * @param {Date} lastCommitDate - Date of the last commit.
     * @returns {number} - Recency score between 0 and 1.
     */
    private calculateRecencyScore(lastCommitDate: Date): number {
        const today = new Date();
        const daysSinceLastCommit = (today.getTime() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24);

        // Score decreases as days since last commit increases
        return Math.max(1 - daysSinceLastCommit / 365, 0);
    }
}
