const axios = require('axios');
const puppeteer = require('puppeteer-core');
const { getBrowserOptions } = require('../utils/browser');

/**
 * Gets follower count for a game/developer Facebook page
 * @param {string} pageName - Page name on Facebook
 * @returns {Object} Follower information
 */
const getFacebookFollowers = async (pageName = '') => {
    let browser = null;
    let url = '';

    try {
        // Determine the page name
        url = `https://www.facebook.com/${encodeURIComponent(pageName)}`;

        // Get browser options based on environment
        const browserOptions = await getBrowserOptions();
        
        // Launch browser
        browser = await puppeteer.launch(browserOptions);

        const page = await browser.newPage();

        // Set viewport and user agent to appear as a regular browser
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Set a shorter timeout for serverless environments
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

        // Handle login dialog if it appears by closing it
        try {
            console.log('check login dialog');
            // Wait for the login button to appear and click it
            const closeButton = await page.waitForSelector('div > div:nth-child(1) > div > div:nth-child(5) > div > div > div > div > div > div > div > div > div > div > div', { timeout: 3000 });

            if (closeButton) {
                await page.click('div > div:nth-child(1) > div > div:nth-child(5) > div > div > div > div > div > div > div > div > div > div > div');
                await page.waitForTimeout(500); // Reduced timeout for serverless
            }
            console.log('close dialog login');
        } catch (e) {
            // Login dialog might not appear, continue
            console.log('No login dialog or timeout waiting for it');
        }

        // Try to locate and extract follower count with reduced timeouts
        let followerCount = null;
        let followersSelector = 'div > div:nth-child(1) > div > div > div > div > div > div > div > div > div:nth-child(1) > div > div > div > div > div > div > div > div > span > a:nth-child(2)';

        const textSelector = await page.waitForSelector(followersSelector, { timeout: 5000 }).catch(err => {
            console.error('Selector not found:', err.message);
            return null;
        });
        
        if (!textSelector) {
            console.error('Element not found');
            return {
                platform: "Facebook",
                url: url,
                follower_count: null,
                source: "Facebook Page - Element Not Found",
            };
        }

        const followerNumber = await textSelector.evaluate(el => el.textContent);

        console.log('The Facebook follower count is "%s".', followerNumber);

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
            return {
                platform: "Facebook",
                url: url,
                follower_count: null,
                source: "Facebook Page - Parsing Error",
            };
        }

        const calculateFollowerCount = (num, multiplier) => Math.round(num * multiplier);

        const number = parseFloat(numberMatch[1]);
        const suffix = (numberMatch[3] || '').toUpperCase(); 
        
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

        if (isNaN(followerCount) || followerCount < 0) {
            return {
                platform: "Facebook",
                url: url,
                follower_count: null,
                source: "Facebook Page - Error",
            };
        }

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
            url: url || "",
            follower_count: null,
            source: `Facebook Scraping - Error: ${error.message}`,
        };
    } finally {
        // Always close the browser to prevent memory leaks
        if (browser) {
            await browser.close().catch(err => console.error('Error closing browser:', err));
        }
    }
};

module.exports = { getFacebookFollowers };