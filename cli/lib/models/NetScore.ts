// imports
import { Metric } from './Metric';
import { SystemLogger } from '../utilities/logger';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
SystemLogger.initialize();

export class NetScore extends Metric {
    private latency: number;

    constructor(URL: string, scores: number[], weights: number[], latencies: number[]) {
        SystemLogger.info(`License initialized with URL: ${URL}`);
        super(URL);
        this.score = 0; // Initialize score with a default number value

        // Ensure the scores, weights, and latencies arrays have the correct length (5 elements each)
        if (scores.length !== 5 || weights.length !== 5 || latencies.length !== 5) {
            throw new Error("Scores, weights, and latencies arrays must have exactly 5 elements each.");
        }

        // Apply Sarah's formula to calculate the NetScore:
        // license * (0.4 * RM + 0.2 * BF + 0.2 * C + 0.2 * RM) * other
        const license = scores[0];  // License score (0 or 1)
        const RM = scores[1];       // Responsiveness metric
        const BF = scores[3];       // Bus factor
        const C = scores[4];        // Correctness
        const other = scores[2];    // Other factor

        this.score = license * (0.4 * RM + 0.2 * BF + 0.2 * C + 0.2 * RM) * other;

        // Calculate the total latency and round to the third decimal place
        this.latency = parseFloat(latencies.reduce((acc, value) => acc + value, 0).toFixed(3));
    }

    public getLatency(): number {
        return this.latency;
    }
}
