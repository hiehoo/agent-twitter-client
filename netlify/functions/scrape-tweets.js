import FeedScraperAgent from '../../FeedScraperAgent.js';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Get the current file URL and file path (needed for ESM imports in Netlify Functions)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Security token to prevent unauthorized access
const AUTH_TOKEN = process.env.WEBHOOK_AUTH_TOKEN || 'change-me-to-a-secure-token';

export const handler = async (event, context) => {
  // Check if this is a preflight request (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow GET and POST requests
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Get token from authorization header or query param
  const authHeader = event.headers.authorization || '';
  const token = authHeader.split(' ')[1] || event.queryStringParameters?.token || '';

  // Validate token
  if (token !== AUTH_TOKEN) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    // Parse options from query parameters or body
    let options = {
      maxTweetsPerProfile: 10,
      includeRetweets: false,
      outputDir: '/tmp/twitter-scraper'  // Use /tmp for Netlify Functions
    };

    // Parse query parameters for options
    if (event.queryStringParameters) {
      if (event.queryStringParameters.maxTweets) {
        options.maxTweetsPerProfile = parseInt(event.queryStringParameters.maxTweets, 10);
      }
      if (event.queryStringParameters.includeRetweets) {
        options.includeRetweets = event.queryStringParameters.includeRetweets === 'true';
      }
    }

    // Parse body for options (POST only)
    if (event.httpMethod === 'POST' && event.body) {
      try {
        const body = JSON.parse(event.body);
        if (body.options) {
          options = { ...options, ...body.options };
        }
      } catch (e) {
        console.error('Error parsing request body:', e);
      }
    }

    console.log('Initializing feed scraper with options:', options);
    
    // Create a feed scraper agent
    const agent = new FeedScraperAgent(options);
    
    // Initialize and authenticate
    // Either use profiles from the request or from a default file
    let profiles = [];
    
    if (event.httpMethod === 'POST' && event.body) {
      try {
        const body = JSON.parse(event.body);
        if (body.profiles && Array.isArray(body.profiles)) {
          profiles = body.profiles;
          agent.setProfiles(profiles);
        }
      } catch (e) {
        console.error('Error parsing profiles from request body:', e);
      }
    }
    
    if (profiles.length === 0) {
      // Default to profiles.json if no profiles provided
      await agent.initialize('../../profiles.json');
    } else {
      // Just initialize authentication without loading profiles
      await agent.initialize();
    }
    
    console.log(`Fetching tweets from ${agent.profiles.length} profiles...`);
    const results = await agent.fetchAllProfileTweets();
    
    // Save results to file
    const outputPath = await agent.saveResults(results);
    
    // Create a summarized version of the results for the response
    const summary = Object.entries(results).map(([username, tweets]) => {
      if (Array.isArray(tweets)) {
        return {
          username,
          count: tweets.length,
          tweets: tweets.map(tweet => ({
            id: tweet.id,
            text: tweet.text?.substring(0, 100) + (tweet.text?.length > 100 ? '...' : ''),
            date: tweet.date,
            likes: tweet.likes,
            replies: tweet.replies,
            retweets: tweet.retweets
          }))
        };
      } else {
        return {
          username,
          error: tweets.error
        };
      }
    });

    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        profilesCount: agent.profiles.length,
        tweetsCount: Object.values(results).reduce((acc, tweets) => 
          acc + (Array.isArray(tweets) ? tweets.length : 0), 0
        ),
        summary,
        outputPath
      })
    };
  } catch (error) {
    console.error('Error in serverless function:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}; 