const axios = require('axios');

/**
 * Gets follower count for a game/developer subreddit
 * @param {string} game - Game name
 * @param {string} developer - Developer name
 * @returns {Object} Follower information
 */
const getRedditFollowers = async (game = '', developer = '') => {
  try {
    // Construct the subreddit URL based on game name
    const subreddit = game.replace(/\s+/g, '');
    const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/about.json`;
    
    // Make request to Reddit API
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'game-follower-api/1.0.0' }
    });
    
    // Extract subscriber count from response
    const followerCount = response.data?.data?.subscribers || 0;
    
    return {
      platform: "Reddit",
      url: `https://www.reddit.com/r/${subreddit}`,
      follower_count: followerCount,
      source: "Reddit API"
    };
  } catch (error) {
    console.error(`Error fetching Reddit followers: ${error.message}`);
    return {
      platform: "Reddit",
      url: "",
      follower_count: null,
      source: "Reddit API - Error"
    };
  }
};

module.exports = { getRedditFollowers };