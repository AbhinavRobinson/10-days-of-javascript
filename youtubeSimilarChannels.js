import { google } from 'googleapis';

/**
 * YouTube Similar Channels Finder
 * Uses YouTube Data API v3 to find channels similar to a given username
 */
class YouTubeSimilarChannels {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('YouTube API key is required');
    }
    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey
    });
  }

  /**
   * Get channel information by username
   * @param {string} username - YouTube username (without @)
   * @returns {Promise<Object>} Channel information
   */
  async getChannelByUsername(username) {
    try {
      const response = await this.youtube.channels.list({
        part: ['snippet', 'contentDetails', 'statistics', 'topicDetails'],
        forUsername: username
      });

      if (response.data.items && response.data.items.length > 0) {
        return response.data.items[0];
      }
      
      // If forUsername doesn't work, try searching by username
      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        q: username,
        type: 'channel',
        maxResults: 1
      });

      if (searchResponse.data.items && searchResponse.data.items.length > 0) {
        const channelId = searchResponse.data.items[0].snippet.channelId;
        const channelResponse = await this.youtube.channels.list({
          part: ['snippet', 'contentDetails', 'statistics', 'topicDetails'],
          id: [channelId]
        });
        return channelResponse.data.items[0];
      }

      throw new Error(`Channel not found for username: ${username}`);
    } catch (error) {
      throw new Error(`Error fetching channel: ${error.message}`);
    }
  }

  /**
   * Get channel information by channel ID
   * @param {string} channelId - YouTube channel ID
   * @returns {Promise<Object>} Channel information
   */
  async getChannelById(channelId) {
    try {
      const response = await this.youtube.channels.list({
        part: ['snippet', 'contentDetails', 'statistics', 'topicDetails'],
        id: [channelId]
      });

      if (response.data.items && response.data.items.length > 0) {
        return response.data.items[0];
      }
      throw new Error(`Channel not found for ID: ${channelId}`);
    } catch (error) {
      throw new Error(`Error fetching channel: ${error.message}`);
    }
  }

  /**
   * Get similar channels using relatedToChannelId parameter
   * @param {string} channelId - YouTube channel ID
   * @param {number} maxResults - Maximum number of results (default: 10)
   * @returns {Promise<Array>} Array of similar channels
   */
  async getSimilarChannelsByRelated(channelId, maxResults = 10) {
    try {
      const response = await this.youtube.search.list({
        part: ['snippet'],
        relatedToChannelId: channelId,
        type: 'channel',
        maxResults: maxResults
      });

      return response.data.items || [];
    } catch (error) {
      throw new Error(`Error fetching similar channels: ${error.message}`);
    }
  }

  /**
   * Get similar channels based on topic/category
   * @param {string} channelId - YouTube channel ID
   * @param {number} maxResults - Maximum number of results (default: 10)
   * @returns {Promise<Array>} Array of similar channels
   */
  async getSimilarChannelsByTopic(channelId, maxResults = 10) {
    try {
      // First get the channel's topic details
      const channel = await this.getChannelById(channelId);
      const topicIds = channel.topicDetails?.topicIds || [];
      
      if (topicIds.length === 0) {
        return [];
      }

      // Search for channels with similar topics
      // Note: YouTube API doesn't directly support topic-based channel search,
      // so we'll use the first topic ID to search for related content
      const response = await this.youtube.search.list({
        part: ['snippet'],
        q: topicIds[0], // Use first topic as search query
        type: 'channel',
        maxResults: maxResults
      });

      // Filter out the original channel
      return (response.data.items || []).filter(
        item => item.snippet.channelId !== channelId
      );
    } catch (error) {
      throw new Error(`Error fetching channels by topic: ${error.message}`);
    }
  }

  /**
   * Get similar channels based on search terms from channel description/title
   * @param {string} channelId - YouTube channel ID
   * @param {number} maxResults - Maximum number of results (default: 10)
   * @returns {Promise<Array>} Array of similar channels
   */
  async getSimilarChannelsByKeywords(channelId, maxResults = 10) {
    try {
      const channel = await this.getChannelById(channelId);
      const title = channel.snippet.title;
      const description = channel.snippet.description || '';
      
      // Extract keywords from title (first few words)
      const keywords = title.split(' ').slice(0, 3).join(' ');
      
      const response = await this.youtube.search.list({
        part: ['snippet'],
        q: keywords,
        type: 'channel',
        maxResults: maxResults * 2 // Get more to filter out original
      });

      // Filter out the original channel and limit results
      return (response.data.items || [])
        .filter(item => item.snippet.channelId !== channelId)
        .slice(0, maxResults);
    } catch (error) {
      throw new Error(`Error fetching channels by keywords: ${error.message}`);
    }
  }

  /**
   * Get comprehensive list of similar channels using multiple methods
   * @param {string} username - YouTube username
   * @param {Object} options - Options object
   * @param {number} options.maxResults - Maximum results per method (default: 5)
   * @param {boolean} options.includeRelated - Include related channels (default: true)
   * @param {boolean} options.includeTopic - Include topic-based channels (default: true)
   * @param {boolean} options.includeKeywords - Include keyword-based channels (default: true)
   * @returns {Promise<Object>} Object containing channel info and similar channels
   */
  async getSimilarChannels(username, options = {}) {
    const {
      maxResults = 5,
      includeRelated = true,
      includeTopic = true,
      includeKeywords = true
    } = options;

    try {
      // Get the channel information
      const channel = await this.getChannelByUsername(username);
      const channelId = channel.id;

      const similarChannels = {
        related: [],
        topic: [],
        keywords: []
      };

      // Get related channels
      if (includeRelated) {
        try {
          similarChannels.related = await this.getSimilarChannelsByRelated(channelId, maxResults);
        } catch (error) {
          console.warn(`Warning: Could not fetch related channels: ${error.message}`);
        }
      }

      // Get topic-based channels
      if (includeTopic) {
        try {
          similarChannels.topic = await this.getSimilarChannelsByTopic(channelId, maxResults);
        } catch (error) {
          console.warn(`Warning: Could not fetch topic-based channels: ${error.message}`);
        }
      }

      // Get keyword-based channels
      if (includeKeywords) {
        try {
          similarChannels.keywords = await this.getSimilarChannelsByKeywords(channelId, maxResults);
        } catch (error) {
          console.warn(`Warning: Could not fetch keyword-based channels: ${error.message}`);
        }
      }

      // Combine and deduplicate channels
      const allChannels = [
        ...similarChannels.related,
        ...similarChannels.topic,
        ...similarChannels.keywords
      ];

      const uniqueChannels = [];
      const seenIds = new Set();

      for (const channel of allChannels) {
        if (!seenIds.has(channel.snippet.channelId)) {
          seenIds.add(channel.snippet.channelId);
          uniqueChannels.push(channel);
        }
      }

      return {
        originalChannel: {
          id: channel.id,
          title: channel.snippet.title,
          description: channel.snippet.description,
          thumbnail: channel.snippet.thumbnails?.default?.url,
          subscriberCount: channel.statistics?.subscriberCount,
          videoCount: channel.statistics?.videoCount,
          viewCount: channel.statistics?.viewCount
        },
        similarChannels: {
          byMethod: similarChannels,
          combined: uniqueChannels
        }
      };
    } catch (error) {
      throw new Error(`Error getting similar channels: ${error.message}`);
    }
  }

  /**
   * Format channel data for display
   * @param {Object} channel - Channel snippet object
   * @returns {Object} Formatted channel data
   */
  formatChannel(channel) {
    return {
      channelId: channel.snippet.channelId,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnail: channel.snippet.thumbnails?.default?.url,
      publishedAt: channel.snippet.publishedAt
    };
  }
}

export default YouTubeSimilarChannels;
