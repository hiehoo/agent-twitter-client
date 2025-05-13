#!/usr/bin/env node
import FeedScraperAgent from './FeedScraperAgent.js';
import { parseArgs } from 'node:util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file URL and file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    // Parse command line arguments
    const { values } = parseArgs({
      options: {
        profiles: {
          type: 'string',
          short: 'p',
          default: './profiles.json'
        },
        max: {
          type: 'string',
          short: 'm',
          default: '10'
        },
        output: {
          type: 'string',
          short: 'o',
          default: './output'
        },
        retweets: {
          type: 'boolean',
          short: 'r',
          default: true
        },
        replies: {
          type: 'boolean',
          short: 'R',
          default: false
        },
        help: {
          type: 'boolean',
          short: 'h',
          default: false
        }
      }
    });

    // Display help if requested
    if (values.help) {
      console.log(`
Twitter Feed Scraper - Usage:
  node run-feed-scraper.js [options]

Options:
  -p, --profiles <path>    Path to profiles.json file (default: ./profiles.json)
  -m, --max <number>       Maximum tweets per profile (default: 10)
  -o, --output <dir>       Output directory (default: ./output)
  -r, --retweets           Include retweets (default: true)
  -R, --replies            Include replies (default: false)
  -h, --help               Display this help message
      `);
      return;
    }

    // Ensure profiles file exists
    const profilesPath = values.profiles;
    try {
      await fs.access(profilesPath);
    } catch (error) {
      console.error(`Error: Profiles file not found at ${profilesPath}`);
      console.log('Creating a sample profiles file...');
      
      const sampleProfiles = [
        'elonmusk',
        'BillGates',
        'BarackObama'
      ];
      
      // Ensure directory exists
      const dir = path.dirname(profilesPath);
      await fs.mkdir(dir, { recursive: true });
      
      // Write the file
      await fs.writeFile(profilesPath, JSON.stringify(sampleProfiles, null, 2), 'utf8');
      console.log(`Created sample profiles file at ${profilesPath}`);
    }

    // Initialize the feed scraper agent
    const agent = new FeedScraperAgent({
      maxTweetsPerProfile: parseInt(values.max, 10),
      outputDir: values.output,
      includeRetweets: values.retweets,
      includeReplies: values.replies
    });
    
    // Initialize and run
    console.log('Initializing agent and authenticating with Twitter...');
    await agent.initialize(profilesPath);
    
    console.log('Starting feed scraping...');
    const startTime = Date.now();
    const results = await agent.run();
    const endTime = Date.now();
    
    // Print summary
    const totalTweets = Object.values(results).reduce((acc, tweets) => 
      acc + (Array.isArray(tweets) ? tweets.length : 0), 0);
    
    console.log('\nSummary:');
    console.log('='.repeat(40));
    console.log(`Total profiles processed: ${Object.keys(results).length}`);
    console.log(`Total tweets collected: ${totalTweets}`);
    console.log(`Time taken: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
    console.log('='.repeat(40));
    
    // Print individual profile stats
    for (const [username, tweets] of Object.entries(results)) {
      const count = Array.isArray(tweets) ? tweets.length : 0;
      const status = Array.isArray(tweets) ? '✅' : '❌';
      console.log(`${status} ${username}: ${count} tweets`);
    }
    
  } catch (error) {
    console.error('Error running feed scraper:', error);
    process.exit(1);
  }
}

run(); 