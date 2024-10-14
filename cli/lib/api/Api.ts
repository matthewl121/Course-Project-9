import { ApiResponse, Url } from "../typedefs/definitions";
import axios, { AxiosResponse } from 'axios';
import * as dotenv from 'dotenv';
import { SystemLogger } from "../utilities/logger";

// Load environment variables from .env file
dotenv.config();
SystemLogger.initialize();

interface ApiArgs {
    url: Url;
}

/**
 * API class
 * @class API
 * @param {ApiArgs} args
 * @param {Url} args.url - URL to make the request
 * @example
 * const api = new API({ url: 'https://api.github.com' });
 * const response = await api.get('/users/octocat');
 * console.log(response);
 * @throws {Error} - Error making GET request
 */
class API {
    protected _url: Url;

    constructor(args: ApiArgs) {
        this._url = args.url;
    }

    async get(endpoint: string): Promise<ApiResponse> {
        try {
            SystemLogger.info(`Making GET request to ${endpoint}`);
            const response: AxiosResponse = await axios.get(`${endpoint}`);
            SystemLogger.info(`GET request successful`);
            return response.data;
        } catch (error) {
            SystemLogger.error('Error making GET request:');
            throw error;
        }
    }


}

/**
 * GitHubApi class
 * @class GitHubApi
 * @extends API
 * @param {ApiArgs} args
 * @param {Url} args.url - URL to make the request
 * @example
 * const githubApi = new GitHubApi();
 * const response = await githubApi.get('/users/octocat');
 * console.log(response);
 */
class GitHubApi extends API {
    private token: string | undefined;

    constructor() {
        super({ url: 'https://api.github.com' });
        this.token = process.env.GITHUB_TOKEN; // Load token from environment variable
    }

    async get(endpoint: string): Promise<ApiResponse> {
        try {
            const response: AxiosResponse = await axios.get(`${this._url}${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${this.token}` // Set the authorization header
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error making GET request to GitHub API:', error);
            throw error;
        }
    }
}


/**
 * NpmApi class
 * @class NpmApi
 * @extends API
 * @param {ApiArgs} args
 * @param {Url} args.url - URL to make the request
 * @example
 * const npmApi = new NpmApi();
 * const response = await npmApi.get('/octocat');
 * console.log(response);
 */
class NpmApi extends API {
    constructor() {
        super({ url: 'https://registry.npmjs.org' });
    }

    async getRepo(endpoint: string): Promise<string> {
        SystemLogger.info(`NPMjs URL: ${this._url}${endpoint}`);
        const response: AxiosResponse = await axios.get(`${this._url}${endpoint}`);
        SystemLogger.info(`NPMjs Response: ${response}`);
        let repoUrl: string = response.data.repository.url;
        if (repoUrl === undefined) {
            throw new Error('NPMjs URL: GitHub Repository URL not found');
        }
        // Remove 'git+' prefix from the start and '.git' suffix from the end
        repoUrl = repoUrl.replace(/^git\+/, '').replace(/\.git$/, '');

        return repoUrl;
    }

}

export { GitHubApi, NpmApi };