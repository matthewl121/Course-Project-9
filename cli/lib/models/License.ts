//imports
import * as git from 'isomorphic-git';
import * as fs from 'fs';
import * as http from 'isomorphic-git/http/node';
import { Metric } from './Metric';
import { SystemLogger } from '../utilities/logger';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
SystemLogger.initialize();

export class License extends Metric {
    private compatibleLicenses: string[]; // List of compatible licenses
    private repoPath: string; // Path to the repository on the local filesystem

    constructor(URL: string, compatibleLicenses: string[] = ['LGPLv2.1', 'MIT', 'Apache-2.0']) {
        SystemLogger.info(`License initialized with URL: ${URL}`);
        super(URL);
        this.repoPath = `${process.cwd()}/test`; // Set repoPath to './test'

        this.compatibleLicenses = compatibleLicenses; // Initialize the list of compatible licenses
        this.score = 0; // Initialize score with a default number value
    }

    public async init(): Promise<void> {
        this.cleanUpRepo(); // Clean up the cloned repository
        this.score = await this.checkCompatibilityWithLicenses(this.URL);
        SystemLogger.info(`License score initialized to: ${this.score}`);
        this.cleanUpRepo(); // Clean up the cloned repository
    }

    private async checkCompatibilityWithLicenses(Url: string): Promise<number> {
        try {
            // Initialize the repository in the 'test' folder
            SystemLogger.info(`Initializing repository in ${this.repoPath}`);
            await git.init({
                fs,
                dir: this.repoPath, // Initialize the repository in './test'
                defaultBranch: 'main',
            });
            try {
                // Clone the repository to the 'test' folder
                await git.clone({
                    fs,
                    http, // Use http for HTTP and HTTPS requests
                    dir: this.repoPath, // Clone into './test'
                    url: Url,
                    depth: 1, // Fetch only the latest commit
                });
            } catch (error) {
                SystemLogger.error(`Error cloning repository: ${error}`);
                throw error;
            }

            SystemLogger.info(`Repo cloned`);
    
            // Define a list of common license file paths
            const licensePaths = [
                'LICENSE',
                'license',
                'LICENSE.txt',
                'license.txt',
                'LICENSE.md',
                'license.md',
            ];
    
            // Check each path for the license file
            for (const path of licensePaths) {
                const filePath = `${this.repoPath}/${path}`;
                if (fs.existsSync(filePath)) {
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    
                    // Determine if the license content matches any known license type
                    for (const license of this.compatibleLicenses) {
                        if (fileContent.includes(license)) {
                            SystemLogger.info(`License is compatible: ${license}`);
                            return 1; // License is compatible
                        }
                    }
                }
            }

            // Define a list of common README file paths
            const readmePaths = [
                'README',
                'README.md',
                'README.txt',
                'README.md',
            ];

             // Check each path for the README file
            for (const path of readmePaths) {
                const filePath = `${this.repoPath}/${path}`;
                if (fs.existsSync(filePath)) {
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    
                    // Check for compatible licenses in the README file
                    for (const license of this.compatibleLicenses) {
                        if (fileContent.includes(license)) {
                            SystemLogger.info(`License found in README: ${license}`);
                            return 1; // License is compatible
                        }
                    }
                }
            }
    
            return 0; // No compatible license found
        } catch (error) {
            SystemLogger.error(`Error checking compatibility`);
            return 0; // Return 0 on error
        }
    }
    

    // Method to remove the cloned repository directory
    private cleanUpRepo(): void {
        if (fs.existsSync(this.repoPath)) {
            try {
                // Recursively remove the 'test' folder
                fs.rmSync(this.repoPath, { recursive: true, force: true });
            } catch (error) {
            }
        } else {
        }
    }
}