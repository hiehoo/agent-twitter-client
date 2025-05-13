import { Scraper } from 'agent-twitter-client';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Get the current file URL and file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FeedScraperAgent {
  constructor(options = {}) {
    this.scraper = new Scraper();
    this.options = {
      maxTweetsPerProfile: 10,
      outputDir: './output',
      outputFormat: 'json',
      includeRetweets: true,
      includeReplies: false,
      ...options
    };
    
    // List of Twitter profiles to monitor
    this.profiles = [];
  }

  /**
   * Log in directly with provided credentials
   */
  async login(
    username,
    password,
    email,
    twoFactorSecret,
    apiKey,
    apiSecretKey,
    accessToken,
    accessTokenSecret
  ) {
    try {
      // Login to Twitter with provided credentials
      await this.scraper.login(
        username,
        password,
        email,
        twoFactorSecret,
        apiKey,
        apiSecretKey,
        accessToken,
        accessTokenSecret
      );
      
      console.log('Logged in successfully!');
      
      // Create output directory if it doesn't exist
      await fs.mkdir(this.options.outputDir, { recursive: true });
      
      return true;
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  }

  /**
   * Initializes the agent and authenticates with Twitter
   */
  async initialize(profilesPath) {
    try {
      // Login to Twitter with credentials from environment variables
      await this.scraper.login(
        process.env.TWITTER_USERNAME,
        process.env.TWITTER_PASSWORD,
        process.env.TWITTER_EMAIL,
        process.env.TWITTER_TWO_FACTOR_SECRET,
        process.env.TWITTER_API_KEY,
        process.env.TWITTER_API_SECRET_KEY,
        process.env.TWITTER_ACCESS_TOKEN,
        process.env.TWITTER_ACCESS_TOKEN_SECRET
      );
      
      console.log('Logged in successfully!');
      
      // Load profiles from file if provided
      if (profilesPath) {
        await this.loadProfiles(profilesPath);
      }
      
      // Create output directory if it doesn't exist
      await fs.mkdir(this.options.outputDir, { recursive: true });
      
      return true;
    } catch (error) {
      console.error('Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Loads profiles from a JSON file
   */
  async loadProfiles(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const profiles = JSON.parse(data);
      
      if (!Array.isArray(profiles)) {
        throw new Error('Profiles file must contain an array of strings');
      }
      
      this.profiles = profiles;
      console.log(`Loaded ${this.profiles.length} profiles`);
      return this.profiles;
    } catch (error) {
      console.error('Failed to load profiles:', error);
      throw error;
    }
  }

  /**
   * Sets the list of profiles to monitor
   */
  setProfiles(profiles) {
    if (!Array.isArray(profiles)) {
      throw new Error('Profiles must be an array of strings');
    }
    this.profiles = profiles;
  }

  /**
   * Fetches tweets from all profiles
   */
  async fetchAllProfileTweets() {
    const results = {};
    
    for (const username of this.profiles) {
      try {
        console.log(`Fetching tweets for ${username}...`);
        const userTweets = await this.fetchUserTweets(username);
        results[username] = userTweets;
      } catch (error) {
        console.error(`Error fetching tweets for ${username}:`, error);
        results[username] = { error: error.message };
      }
    }
    
    return results;
  }

  /**
   * Fetches tweets from a single user
   */
  async fetchUserTweets(username) {
    try {
      const tweets = [];
      const iterator = this.options.includeReplies
        ? this.scraper.getTweetsAndReplies(username, this.options.maxTweetsPerProfile)
        : this.scraper.getTweets(username, this.options.maxTweetsPerProfile);
      
      for await (const tweet of iterator) {
        // Skip retweets if not included
        if (!this.options.includeRetweets && tweet.isRetweet) {
          continue;
        }
        
        tweets.push(this.processTweet(tweet));
        
        // Break if we have enough tweets
        if (tweets.length >= this.options.maxTweetsPerProfile) {
          break;
        }
      }
      
      return tweets;
    } catch (error) {
      console.error(`Error fetching tweets for ${username}:`, error);
      throw error;
    }
  }

  /**
   * Processes and simplifies a tweet object
   */
  processTweet(tweet) {
    return {
      id: tweet.id,
      text: tweet.text,
      timestamp: tweet.timestamp,
      date: tweet.timeParsed ? tweet.timeParsed.toISOString() : null,
      username: tweet.username,
      name: tweet.name,
      likes: tweet.likes,
      retweets: tweet.retweets,
      replies: tweet.replies,
      quotes: tweet.quotes,
      isRetweet: tweet.isRetweet,
      isReply: tweet.isReply,
      isQuoted: tweet.isQuoted,
      hashtags: tweet.hashtags,
      mentions: tweet.mentions,
      urls: tweet.urls,
      photos: tweet.photos,
      videos: tweet.videos,
      permanentUrl: tweet.permanentUrl,
      poll: tweet.poll,
    };
  }

  /**
   * Saves results to a file
   */
  async saveResults(results, filename = `tweets-${new Date().toISOString().replace(/:/g, '-')}`) {
    const outputPath = path.join(this.options.outputDir, `${filename}.${this.options.outputFormat}`);
    
    try {
      if (this.options.outputFormat === 'json') {
        await fs.writeFile(outputPath, JSON.stringify(results, null, 2), 'utf8');
      } else {
        // Add support for other formats if needed
        throw new Error(`Unsupported output format: ${this.options.outputFormat}`);
      }
      
      console.log(`Results saved to ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('Failed to save results:', error);
      throw error;
    }
  }

  /**
   * Runs the feed scraper
   */
  async run() {
    if (!this.profiles.length) {
      console.error('No profiles to monitor. Use setProfiles() or loadProfiles() first.');
      return false;
    }
    
    try {
      const results = await this.fetchAllProfileTweets();
      await this.saveResults(results);
      return results;
    } catch (error) {
      console.error('Failed to run feed scraper:', error);
      return false;
    }
  }
}

// Example usage
async function main() {
  try {
    // Create sample profiles file if it doesn't exist
    const profilesPath = './profiles.json';
    try {
      await fs.access(profilesPath);
    } catch {
      // Sample profiles file doesn't exist, create it
      const sampleProfiles = [
        'elonmusk',
        'BillGates',
        'BarackObama'
      ];
      await fs.writeFile(profilesPath, JSON.stringify(sampleProfiles, null, 2), 'utf8');
      console.log(`Created sample profiles file at ${profilesPath}`);
    }
    
    // Initialize the feed scraper agent
    const agent = new FeedScraperAgent({
      maxTweetsPerProfile: 5,
      includeRetweets: true,
      includeReplies: false
    });
    
    await agent.initialize(profilesPath);
    const results = await agent.run();
    
    // Print summary
    for (const [username, tweets] of Object.entries(results)) {
      console.log(`${username}: ${Array.isArray(tweets) ? tweets.length : 0} tweets fetched`);
    }
  } catch (error) {
    console.error('Error in main:', error);
  }
}

// Run the agent if this file is executed directly
// ES module equivalent of CommonJS's `if (require.main === module)`
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export the agent class for reuse in other scripts
export default FeedScraperAgent; 