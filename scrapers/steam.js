const puppeteer = require('puppeteer');

/**
 * Gets follower count for a game/developer on Steam
 * @param {string} steamId - Game steam ID
 * @returns {Object} Follower information
 */
const getSteamFollowers = async (steamId = '') => {
    try {
        // Example URL structure - adjust based on actual Steam data source
        const url = `https://steamspy.com/app/${steamId}`;
        let followerCount = null;

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setViewport({ width: 600, height: 1000 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        await page.goto(url, {
            waitUntil: 'networkidle2',
        });

        await page.screenshot({
            path: 'steam.png',
        });
        console.log('take snapshot');

        let followersSelector = '::-p-xpath(/html/body/div[3]/div[2]/div/div[2]/div/div[2]/div[1]/div/p[1])';

        const textSelector = await page.waitForSelector(followersSelector);
        if (!textSelector) {
            console.error('Element not found');
            await browser.close();
            return {
                platform: "Steam",
                url: url,
                follower_count: null,
                source: "Steam Page - Error",
            };
            return;
        }

        const followerNumber = await textSelector?.evaluate(el => el.textContent);

        // console.log('The Steam follower count is "%s".', followerNumber);
        //select the number from the text and convert to an integer
        // example: "Followers: 1,003,950 " -> 1003950
        //create regex to extract the number from the string
        const regex = /Followers:\s*([\d,]+)/;
        const match = followerNumber.match(regex);
        if (match) {
            followerCount = parseInt(match[1].replace(/,/g, ''), 10);
        } else {
            console.error('Follower count not found in the text');
        }
        console.log('The follower count is "%s".', followerCount);

        await browser.close();

        // If the follower count is not found, return null
        if (!followerNumber) {
            return {
                platform: "Steam",
                url: url,
                follower_count: null,
                source: "Steam Page - Error",
            };
        }

        return {
            platform: "Steam",
            url: url,
            follower_count: followerCount,
            source: "Steam Store"
        };
    } catch (error) {
        console.error(`Error fetching Steam followers: ${error.message}`);
        return {
            platform: "Steam",
            url: "",
            follower_count: null,
            source: "Steam Store - Error"
        };
    }
};

module.exports = { getSteamFollowers };