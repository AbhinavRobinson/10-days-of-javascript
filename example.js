import YouTubeSimilarChannels from './youtubeSimilarChannels.js';

/**
 * Example usage of YouTube Similar Channels API
 * 
 * To use this script:
 * 1. Get a YouTube Data API v3 key from Google Cloud Console
 * 2. Set it as an environment variable: export YOUTUBE_API_KEY='your-api-key'
 * 3. Run: node example.js
 */

// Get API key from environment variable
const API_KEY = process.env.YOUTUBE_API_KEY;

if (!API_KEY) {
  console.error('Error: YOUTUBE_API_KEY environment variable is not set');
  console.error('Please set it using: export YOUTUBE_API_KEY="your-api-key"');
  process.exit(1);
}

async function main() {
  try {
    // Initialize the YouTube Similar Channels finder
    const finder = new YouTubeSimilarChannels(API_KEY);

    // Example: Get similar channels for a username
    // Replace 'mkbhd' with any YouTube username
    const username = process.argv[2] || 'mkbhd';
    
    console.log(`\n🔍 Finding similar channels for: ${username}\n`);
    console.log('⏳ Please wait...\n');

    const result = await finder.getSimilarChannels(username, {
      maxResults: 5,
      includeRelated: true,
      includeTopic: true,
      includeKeywords: true
    });

    // Display original channel info
    console.log('📺 Original Channel:');
    console.log('─'.repeat(50));
    console.log(`Title: ${result.originalChannel.title}`);
    console.log(`Channel ID: ${result.originalChannel.id}`);
    console.log(`Subscribers: ${result.originalChannel.subscriberCount || 'N/A'}`);
    console.log(`Videos: ${result.originalChannel.videoCount || 'N/A'}`);
    console.log(`Views: ${result.originalChannel.viewCount || 'N/A'}`);
    console.log('');

    // Display similar channels
    console.log('🔗 Similar Channels (Combined):');
    console.log('─'.repeat(50));
    
    if (result.similarChannels.combined.length === 0) {
      console.log('No similar channels found.');
    } else {
      result.similarChannels.combined.forEach((channel, index) => {
        const formatted = finder.formatChannel(channel);
        console.log(`\n${index + 1}. ${formatted.title}`);
        console.log(`   Channel ID: ${formatted.channelId}`);
        console.log(`   Description: ${formatted.description?.substring(0, 100) || 'N/A'}...`);
        console.log(`   Published: ${new Date(formatted.publishedAt).toLocaleDateString()}`);
      });
    }

    // Display breakdown by method
    console.log('\n\n📊 Breakdown by Method:');
    console.log('─'.repeat(50));
    
    console.log(`\nRelated Channels: ${result.similarChannels.byMethod.related.length}`);
    console.log(`Topic-based Channels: ${result.similarChannels.byMethod.topic.length}`);
    console.log(`Keyword-based Channels: ${result.similarChannels.byMethod.keywords.length}`);
    console.log(`Total Unique Channels: ${result.similarChannels.combined.length}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the example
main();
