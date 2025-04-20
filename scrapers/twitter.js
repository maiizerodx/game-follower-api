const puppeteer = require('puppeteer');

// get data by game name and developer name
async function getTwitterFollowers(account = '') {
  // Use developer name if available, otherwise use game name
  const username = account;
  // Remove spaces and special characters
  const cleanUsername = username.replace(/[^\w]/g, '');
  const url = `https://x.com/${cleanUsername}`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: 'networkidle2',
  });

  await page.screenshot({
    path: 'twitter.png',
  });

  // Wait and click on first result
  const followersSelector = '#react-root > div > div > div > main > div > div > div > div > div > div:nth-child(3) > div > div > div:nth-child(1) > div > div > div:nth-child(2) > a';


  // Locate the full title with a unique string
  const textSelector = await page.waitForSelector(followersSelector);
  if (!textSelector) {
    console.error('Element not found');
    await browser.close();
    return;
  }

  const followerNumber = await textSelector?.evaluate(el => el.textContent);

  console.log('The follower count is "%s".', followerNumber);

  await browser.close();

  // If the follower count is not found, return null
  if (!followerNumber) {
    return {
      platform: "Twitter",
      url: url,
      follower_count: null,
      source: "Twitter Page - Error",
    };
  }
  // Extract the number from the text and convert to an integer
  // example: "123K" -> 123000
  // example: "1.2M" -> 1200000
  // example: "2,273" -> 2273
  // example: "123" -> 123
  if (typeof followerNumber !== 'string') {
    return {
      platform: "Twitter",
      url: url,
      follower_count: null,
      source: "Twitter Page - Invalid Data",
    };
  }
  const numberMatch = followerNumber.replace(/,/g, '').match(/(\d+(\.\d+)?)([KMB])?/i);
  if (!numberMatch) {
    const number = numberMatch[1] ? parseFloat(numberMatch[1]) : NaN;
    return {
      url: url,
      follower_count: null,
      source: "Twitter Page - Parsing Error",
    };
  }

  const calculateFollowerCount = (num, multiplier) => Math.round(num * multiplier);

  let followerCount = 0;
  const number = parseFloat(numberMatch[1]);
  const suffix = (numberMatch[3] || '').toUpperCase(); // Ensure suffix is uppercase for consistency
  switch (suffix) {
    case 'K':
      followerCount = calculateFollowerCount(number, 1000);
      break;
    case 'M':
      followerCount = calculateFollowerCount(number, 1000000);
      break;
    case 'B':
      followerCount = calculateFollowerCount(number, 1000000000);
      break;
    default:
      followerCount = calculateFollowerCount(number, 1);
  }

  // If the follower count is not a number, return null
  if (isNaN(followerCount)) {
    return {
      platform: "Twitter",
      url: url,
      follower_count: null,
      source: "Twitter Page - Error",
    };
  }
  // If the follower count is less than 0, return null
  if (followerCount < 0) {
    return {
      platform: "Twitter",
      url: url,
      follower_count: null,
      source: "Twitter Page - Error",
    };
  }

  // Return the follower count
  return {
    platform: "Twitter",
    url: url,
    follower_count: followerCount,
    source: "use Selector in Twitter Page",
  };

}

module.exports = { getTwitterFollowers };
