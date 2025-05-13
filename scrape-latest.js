#!/usr/bin/env node
import FeedScraperAgent from './FeedScraperAgent.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the current file URL and file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

async function main() {
  try {
    console.log('Initializing feed scraper...');
    
    // Create a feed scraper agent with specific options:
    // - Only 5 tweets per profile
    // - Skip retweets
    const agent = new FeedScraperAgent({
      maxTweetsPerProfile: 10,
      includeRetweets: false,
      outputDir: './latest-tweets'
    });
    
    // Initialize and authenticate
    await agent.initialize('./profiles.json');
    
    console.log('Fetching the latest 5 non-retweet tweets from each profile...');
    const results = await agent.run();
    
    // Print results summary
    console.log('\nResults Summary:');
    console.log('================');
    
    for (const [username, tweets] of Object.entries(results)) {
      if (Array.isArray(tweets)) {
        console.log(`✅ ${username}: ${tweets.length} tweets fetched`);
        
        // Print tweet details
        tweets.forEach((tweet, index) => {
          console.log(`  ${index + 1}. ${tweet.text?.substring(0, 60)}${tweet.text?.length > 60 ? '...' : ''}`);
          console.log(`     Posted: ${tweet.date} | Likes: ${tweet.likes} | Replies: ${tweet.replies}`);
        });
        
        console.log(''); // Empty line between users
      } else {
        console.log(`❌ ${username}: Error - ${tweets.error}`);
      }
    }
    
    console.log('\nTweets saved to ./latest-tweets directory');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main(); 