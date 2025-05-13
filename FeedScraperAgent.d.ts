export default FeedScraperAgent;
declare class FeedScraperAgent {
    constructor(options?: {});
    scraper: any;
    options: {
        maxTweetsPerProfile: number;
        outputDir: string;
        outputFormat: string;
        includeRetweets: boolean;
        includeReplies: boolean;
    };
    profiles: any[];
    /**
     * Log in directly with provided credentials
     */
    login(username: any, password: any, email: any, twoFactorSecret: any, apiKey: any, apiSecretKey: any, accessToken: any, accessTokenSecret: any): Promise<boolean>;
    /**
     * Initializes the agent and authenticates with Twitter
     */
    initialize(profilesPath: any): Promise<boolean>;
    /**
     * Loads profiles from a JSON file
     */
    loadProfiles(filePath: any): Promise<any[]>;
    /**
     * Sets the list of profiles to monitor
     */
    setProfiles(profiles: any): void;
    /**
     * Fetches tweets from all profiles
     */
    fetchAllProfileTweets(): Promise<{}>;
    /**
     * Fetches tweets from a single user
     */
    fetchUserTweets(username: any): Promise<{
        id: any;
        text: any;
        timestamp: any;
        date: any;
        username: any;
        name: any;
        likes: any;
        retweets: any;
        replies: any;
        quotes: any;
        isRetweet: any;
        isReply: any;
        isQuoted: any;
        hashtags: any;
        mentions: any;
        urls: any;
        photos: any;
        videos: any;
        permanentUrl: any;
        poll: any;
    }[]>;
    /**
     * Processes and simplifies a tweet object
     */
    processTweet(tweet: any): {
        id: any;
        text: any;
        timestamp: any;
        date: any;
        username: any;
        name: any;
        likes: any;
        retweets: any;
        replies: any;
        quotes: any;
        isRetweet: any;
        isReply: any;
        isQuoted: any;
        hashtags: any;
        mentions: any;
        urls: any;
        photos: any;
        videos: any;
        permanentUrl: any;
        poll: any;
    };
    /**
     * Saves results to a file
     */
    saveResults(results: any, filename?: string): Promise<string>;
    /**
     * Runs the feed scraper
     */
    run(): Promise<{}>;
}
