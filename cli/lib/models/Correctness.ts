import * as git from 'isomorphic-git';
import * as fs from 'fs';
import * as http from 'isomorphic-git/http/node';
import { Metric } from './Metric';
import { SystemLogger } from '../utilities/logger';
import { GitHubApi } from '../api/Api';

SystemLogger.initialize();

interface Repository {
    updated_at: string;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
}


export class Correctness extends Metric {
    private repoPath: string;
    public score: number;
    private owner: string;
    private repo: string;
    private githubApi: GitHubApi;

    constructor(Url: string) {
        SystemLogger.info(`Correctness initialized with URL: ${Url}`);
        super(Url);
        this.githubApi = new GitHubApi();
        this.repoPath = `${process.cwd()}/test`;
        this.score = 0;
        [this.owner, this.repo] = this.parseGitHubUrl();
    }

    async init(): Promise<void> {
        await this.cloneRepository();
        this.score = await this.checkCorrectness();
        this.cleanUpRepo();
    }

    private async cloneRepository(): Promise<void> {
        try {
            SystemLogger.info(`Cloning repository from ${this.URL}`);
            await git.clone({
                fs,
                http,
                dir: this.repoPath,
                url: this.URL,
                depth: 1,
            });
        } catch (error) {
            SystemLogger.error(`Error cloning repository: ${error}`);
            throw error;
        }
    }

    private async checkCorrectness(): Promise<number> {
        try {
            let score = 0;
    
            // Check if package.json or README.md exists before proceeding
            const packageExists = fs.existsSync(`${this.repoPath}/package.json`);
            const readmeExists = fs.existsSync(`${this.repoPath}/README.md`);
    
            if (!packageExists && !readmeExists) {
                SystemLogger.info("Neither package.json nor README.md exists in the repository.");
                return 0; // Return 0 if neither file exists
            }
    
            // Proceed with checking correctness if at least one file exists
            score += this.moreDependencies();
            score += this.Readme();
            score += await this.ApiHistory();
    
            if (score >= 1.0) {
                return 1.0;
            }
            return score;
    
        } catch (error) {
            SystemLogger.error(`Error checking correctness: ${error}`);
            return 0;
        }
    }

    private moreDependencies(): number {
        let score = 0;

        const packageJsonPath = `${this.repoPath}/package.json`;
        if (fs.existsSync(packageJsonPath)) {
            //allows to parse with json
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

            if (packageJson.devDependencies) {
                score += 0.025
            }
            if (packageJson.dependencies) {
                score += 0.025
            }
            if (packageJson.scripts) {
                if (packageJson.scripts.build) {
                    score += 0.025
                }
                if (packageJson.scripts.test) {
                    score += 0.05
                }
                if (packageJson.scripts.lint) {
                    score += 0.025
                }
                if (packageJson.scripts.prettier) {
                    score += 0.025
                }
            }
        }
        return score;
    }

    private async ApiHistory(): Promise<number> {
        //commit history, stars, forks, issues, 
        let score = 0;

        //last commit
        const endPoint = `/repos/${this.owner}/${this.repo}`;
        const response = await this.githubApi.get(endPoint) as Repository;
        const comparisonDate = new Date('2024-04-01T00:00:00Z');
        const lastCommitDate = new Date(response.updated_at);

        if (lastCommitDate > comparisonDate) {
            score += 0.15
        }
        if (response.forks_count > 1000) {
            score += 0.2
        }
        if (response.open_issues_count <= 50) {
            score += 0.1
        }
        if (response.stargazers_count >= 10_000) {

            score += 0.2
        }
        if (response.stargazers_count >= 50_000) {

            score += 0.4
        }
        return score;
    }

    private Readme(): number {
        //readme, downloads
        let score = 0;

        const ReadmePath = `${this.repoPath}/README.md`;
        if (fs.existsSync(ReadmePath)) {
            score+=0.05

            const readmeContent = fs.readFileSync(ReadmePath, 'utf-8');
            const npmDownloadsBadge = /\[!\[.*NPM Downloads.*\]\[npm-downloads\]\]\s?\[npmtrends-url\]/;


            if (npmDownloadsBadge.test(readmeContent)) {
                score += 0.3; 
            }

        }
        return score;
    }

    private parseGitHubUrl(): [string, string] {
        const parts = this.URL.split('/');
        return [parts[3], parts[4]];
    }

    private cleanUpRepo(): void {
        if (fs.existsSync(this.repoPath)) {
            try {
                fs.rmSync(this.repoPath, { recursive: true, force: true });
            } catch (error) {
                SystemLogger.error(`Error cleaning up repository: ${error}`);
            }
        }
    }
}