const axios = require('axios');
const puppeteer = require('puppeteer');

/**
 * Gets follower count for a game/developer Facebook page
 * @param {string} game - Game name
 * @param {string} developer - Developer name
 * @returns {Object} Follower information
 */
const getFacebookFollowers = async (pageName = '') => {
    let browser = null;

    try {
        // Determine the page name (prioritize developer if available)
        const url = `https://www.facebook.com/${encodeURIComponent(pageName)}`;

        // Launch browser
        browser = await puppeteer.launch({
            headless: 'new', // Use new headless mode
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Set viewport and user agent to appear as a regular browser
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Navigate to the page
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Handle login dialog if it appears by closeing it
        try {
            console.log('check login dialog');
            // Wait for the login button to appear and click it

            const closeButton = await page.waitForSelector('div > div:nth-child(1) > div > div:nth-child(5) > div > div > div > div > div > div > div > div > div > div > div');

            if (closeButton) {
                await page.click('div > div:nth-child(1) > div > div:nth-child(5) > div > div > div > div > div > div > div > div > div > div > div');
                await page.waitForTimeout(1000);
            }
            console.log('close dialog login');
        } catch (e) {
            // Login dialog might not appear, continue
        }

        await page.screenshot({
            path: 'facebook.png',
        });

        console.log('take snapshot');

        // Try to locate and extract follower count
        // Note: Facebook's structure changes frequently, so these selectors may need updates
        let followerCount = null;

        let followersSelector = 'div > div:nth-child(1) > div > div > div > div > div > div > div > div > div:nth-child(1) > div > div > div > div > div > div > div > div > span > a:nth-child(2)';

        const textSelector = await page.waitForSelector(followersSelector);
        if (!textSelector) {
            console.error('Element not found');
            await browser.close();
            return;
        }

        const followerNumber = await textSelector?.evaluate(el => el.textContent);

        console.log('The Facebook follower count is "%s".', followerNumber);

        await browser.close();

        // If the follower count is not found, return null
        if (!followerNumber) {
            return {
                platform: "Facebook",
                url: url,
                follower_count: null,
                source: "Facebook Page - Error",
            };
        }
        // Extract the number from the text and convert to an integer
        // example: "123K" -> 123000
        // example: "1.2M" -> 1200000
        // example: "2,273" -> 2273
        // example: "123" -> 123
        if (typeof followerNumber !== 'string') {
            return {
                platform: "Facebook",
                url: url,
                follower_count: null,
                source: "Facebook Page - Invalid Data",
            };
        }
        const numberMatch = followerNumber.replace(/,/g, '').match(/(\d+(\.\d+)?)([KMB])?/i);
        if (!numberMatch) {
            const number = numberMatch[1] ? parseFloat(numberMatch[1]) : NaN;
            return {
                url: url,
                follower_count: null,
                source: "Facebook Page - Parsing Error",
            };
        }

        const calculateFollowerCount = (num, multiplier) => Math.round(num * multiplier);

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
                platform: "Facebook",
                url: url,
                follower_count: null,
                source: "Facebook Page - Error",
            };
        }
        // If the follower count is less than 0, return null
        if (followerCount < 0) {
            return {
                platform: "Facebook",
                url: url,
                follower_count: null,
                source: "Facebook Page - Error",
            };
        }

        // Return the follower count
        return {
            platform: "Facebook",
            url: url,
            follower_count: followerCount,
            source: "use Selector in Facebook Page",
        };


    } catch (error) {
        console.error(`Error fetching Facebook followers: ${error.message}`);
        return {
            platform: "Facebook",
            url: "",
            follower_count: null,
            source: "Facebook Scraping - Error"
        };
    } finally {
        // Always close the browser
        if (browser) {
            await browser.close();
        }
    }
};

module.exports = { getFacebookFollowers };