# Deploying the Twitter Scraper Webhook to Netlify

This document explains how to deploy the Twitter scraper as a serverless function on Netlify, making it available as a webhook.

## Prerequisites

- A GitHub repository containing your code
- A Netlify account
- Twitter login credentials configured in environment variables

## Setup Steps

### 1. Local Development

1. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

3. Run the local development server:
   ```bash
   npm run dev-netlify
   ```

This will start a local server at http://localhost:8888 where you can test the webhook.

### 2. Environment Variables

The following environment variables need to be set in Netlify:

- `TWITTER_USERNAME`: Your Twitter username
- `TWITTER_PASSWORD`: Your Twitter password
- `TWITTER_EMAIL`: The email associated with your Twitter account
- `TWITTER_TWO_FACTOR_SECRET`: Your Twitter 2FA secret (if applicable)
- `WEBHOOK_AUTH_TOKEN`: A secure token to authenticate webhook requests

### 3. Deploying to Netlify

#### Option 1: Deploy via Netlify CLI

1. Login to Netlify:
   ```bash
   netlify login
   ```

2. Initialize the Netlify project (if not already done):
   ```bash
   netlify init
   ```

3. Deploy the site:
   ```bash
   netlify deploy --prod
   ```

#### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. In the Netlify dashboard:
   - Click "New site from Git"
   - Select your repository
   - Configure build settings:
     - Build command: `npm run build-netlify`
     - Publish directory: `public`
   - Click "Deploy site"

3. After deployment, go to "Site settings" > "Environment variables" and add the required environment variables.

## Using the Webhook

### Webhook URL

Your webhook will be available at:
```
https://your-netlify-site.netlify.app/api/scrape-tweets
```

### Authentication

All requests must include an authentication token:

```
Authorization: Bearer YOUR_WEBHOOK_AUTH_TOKEN
```

### Request Methods

- **GET**: Simple trigger with parameters in query string
  ```
  /api/scrape-tweets?token=YOUR_TOKEN&maxTweets=10&includeRetweets=false
  ```

- **POST**: Advanced trigger with options and profiles in request body
  ```json
  {
    "options": {
      "maxTweetsPerProfile": 20,
      "includeRetweets": true
    },
    "profiles": ["elonmusk", "BillGates"]
  }
  ```

## Webhook Response

The webhook returns JSON data with:

```json
{
  "success": true,
  "profilesCount": 2,
  "tweetsCount": 40,
  "summary": [
    {
      "username": "elonmusk",
      "count": 20,
      "tweets": [...]
    },
    {
      "username": "BillGates",
      "count": 20,
      "tweets": [...]
    }
  ],
  "outputPath": "/tmp/twitter-scraper/tweets-2023-05-15T12-34-56.json"
}
```

## Testing

A web interface for testing the webhook is available at the root of your site.

## Troubleshooting

- **Function Timeout**: Netlify has a 10-second timeout for serverless functions. If your scraper takes longer, consider:
  - Reducing the number of profiles or tweets
  - Using background functions (requires Netlify Pro)
  - Implementing an asynchronous pattern with a callback

- **Missing Profiles**: If profiles.json isn't found, either:
  - Include the profiles in the request body
  - Ensure profiles.json is accessible to the function

- **Memory Limits**: If you hit memory limits, reduce the amount of data being processed at once. 