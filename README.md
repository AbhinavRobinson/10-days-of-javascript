# HackerRank 10 days of Javascript

Trying out the hackerrank 10-days-of-javascript.

## YouTube Similar Channels API

This project includes functionality to find similar YouTube channels using the YouTube Data API v3.

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Get YouTube Data API v3 Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the YouTube Data API v3
   - Create credentials (API Key)
   - Copy your API key

3. **Set environment variable:**
   ```bash
   export YOUTUBE_API_KEY='your-api-key-here'
   ```

### Usage

**Run the example:**
```bash
node example.js [username]
```

Example:
```bash
node example.js mkbhd
```

**Use in your code:**
```javascript
import YouTubeSimilarChannels from './youtubeSimilarChannels.js';

const finder = new YouTubeSimilarChannels(process.env.YOUTUBE_API_KEY);

// Get similar channels
const result = await finder.getSimilarChannels('username', {
  maxResults: 5,
  includeRelated: true,
  includeTopic: true,
  includeKeywords: true
});

console.log(result);
```

### API Methods

- `getChannelByUsername(username)` - Get channel info by username
- `getChannelById(channelId)` - Get channel info by channel ID
- `getSimilarChannelsByRelated(channelId, maxResults)` - Get related channels
- `getSimilarChannelsByTopic(channelId, maxResults)` - Get channels with similar topics
- `getSimilarChannelsByKeywords(channelId, maxResults)` - Get channels with similar keywords
- `getSimilarChannels(username, options)` - Comprehensive method that combines all approaches

### Notes

- The YouTube API has rate limits (default: 10,000 units per day)
- Some methods may not return results if the channel doesn't have sufficient metadata
- The `relatedToChannelId` parameter may not always be available for all channels
