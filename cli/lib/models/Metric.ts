import { Url } from "../typedefs/definitions";
import { SystemLogger } from '../utilities/logger';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();    
SystemLogger.initialize();

export class Metric {
    public score: number;
    public URL: Url;

    constructor(Url: string) {
        this.URL = Url;
        this.score = 0;
    }

    getScore() :number {
        return this.score;
    }

    updateScore(newScore: number): void {
        this.score = newScore;
    }
}