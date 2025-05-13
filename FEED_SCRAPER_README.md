# Twitter Feed Scraper Agent

A Node.js agent that helps scrape tweets from a predefined list of Twitter profiles. Built on top of `agent-twitter-client` to enable Twitter data collection without requiring the official Twitter API for most operations.

## Features

- Scrape tweets from multiple Twitter profiles
- Configure the number of tweets to fetch per profile
- Include or exclude retweets and replies
- Save results in JSON format (easily extendable for other formats)
- Manage your list of monitored profiles in a simple JSON file

## Setup

1. Install dependencies:

```sh
npm install agent-twitter-client dotenv
```

2. Create a `.env` file with your Twitter credentials based on the `.env.example` template:

```
# Twitter Credentials
TWITTER_USERNAME=your_username
TWITTER_PASSWORD=your_password
TWITTER_EMAIL=your_email
TWITTER_TWO_FACTOR_SECRET=your_2fa_secret_if_enabled

# Twitter API Credentials (for V2 functionality like polls)
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET_KEY=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret

# Proxy URL (if needed, especially for browser environments)
PROXY_URL=your_proxy_url_if_needed
```

3. Create a `profiles.json` file containing an array of Twitter usernames to monitor:

```json
[
  "elonmusk",
  "BillGates",
  "BarackObama",
  "sundarpichai",
  "satyanadella",
  "tim_cook"
]
```

## Usage

### Basic Usage

```javascript
import FeedScraperAgent from './FeedScraperAgent.js';

async function main() {
  // Initialize the feed scraper agent with custom options
  const agent = new FeedScraperAgent({
    maxTweetsPerProfile: 10,
    outputDir: './my-twitter-data',
    includeRetweets: true,
    includeReplies: false
  });
  
  // Initialize and authenticate with Twitter
  await agent.initialize('./profiles.json');
  
  // Run the scraper to fetch and save tweets
  const results = await agent.run();
  
  // Use the results as needed
  console.log(results);
}

main();
```

### Run from Command Line

You can also run the agent directly from the command line:

```sh
node FeedScraperAgent.js
```

This will:
1. Create a `profiles.json` file with sample profiles if it doesn't exist
2. Initialize the agent with default settings
3. Fetch tweets from all profiles in the file
4. Save the results to the `output` directory

## Configuration Options

The `FeedScraperAgent` constructor accepts the following options:

| Option | Description | Default |
|--------|-------------|---------|
| `maxTweetsPerProfile` | Maximum number of tweets to fetch per profile | 10 |
| `outputDir` | Directory to save output files | './output' |
| `outputFormat` | Format to save results (currently only 'json' supported) | 'json' |
| `includeRetweets` | Whether to include retweets | true |
| `includeReplies` | Whether to include replies | false |

## API

### `initialize(profilesPath?)`

Initializes the agent, authenticates with Twitter, and optionally loads profiles from a file.

### `loadProfiles(filePath)`

Loads profiles from a JSON file.

### `setProfiles(profiles)`

Sets the list of profiles to monitor programmatically.

### `fetchAllProfileTweets()`

Fetches tweets from all monitored profiles.

### `fetchUserTweets(username)`

Fetches tweets from a single user.

### `saveResults(results, filename?)`

Saves the fetched results to a file.

### `run()`

Runs the feed scraper, fetching tweets from all profiles and saving the results.

## Error Handling

The agent includes comprehensive error handling for:
- Authentication failures
- Profile loading issues
- Tweet fetching problems per profile
- File system operations

Errors are logged to the console and also captured in the results structure.

## Data Structure

The output JSON file has the following structure:

```json
{
  "username1": [
    {
      "id": "1234567890",
      "text": "Tweet text content",
      "timestamp": 1612345678,
      "date": "2021-02-03T12:34:56.000Z",
      "username": "username1",
      "name": "User Name",
      "likes": 42,
      "retweets": 7,
      "replies": 3,
      "quotes": 1,
      "isRetweet": false,
      "isReply": false,
      "isQuoted": false,
      "hashtags": ["hashtag1", "hashtag2"],
      "mentions": [
        {
          "id": "987654321",
          "username": "mentioned_user",
          "name": "Mentioned User"
        }
      ],
      "urls": ["https://example.com"],
      "photos": [
        {
          "id": "photo123",
          "url": "https://pbs.twimg.com/media/photo123.jpg",
          "alt_text": "Photo description"
        }
      ],
      "videos": [],
      "permanentUrl": "https://twitter.com/username1/status/1234567890",
      "poll": null
    }
  ],
  "username2": [/* tweets */]
}
``` 