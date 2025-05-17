const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const TOTAL_PAGES = 332;
  const SAVE_FOLDER = 'coming-game-data';
  let buffer = [];

  // Create folder if not exists
  if (!fs.existsSync(SAVE_FOLDER)) {
    fs.mkdirSync(SAVE_FOLDER);
  }

  for (let i = 1; i <= TOTAL_PAGES; i++) {
    const url = `https://store.steampowered.com/search/?filter=comingsoon&ignore_preferences=1&page=${i}`;
    console.log(`Scraping page ${i} of ${TOTAL_PAGES}: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const games = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('a.search_result_row'));
      return rows.map(row => {
        const title = row.querySelector('.title')?.innerText.trim();
        const releaseDate = row.querySelector('.search_released')?.innerText.trim();
        const steamUrl = row.href;
        const appid = row.getAttribute('data-ds-appid');
        const imageUrl = row.querySelector('img')?.src;
        const price = row.querySelector('.discount_final_price')?.innerText.trim() || null;

        return { title, release_date: releaseDate, steam_url: steamUrl, appid, image_url: imageUrl, price };
      });
    });

    buffer.push(...games);

    // Save every 10 pages or at the end
    if (i % 10 === 0 || i === TOTAL_PAGES) {
      const startPage = i - 9 > 0 ? i - 9 : 1;
      const endPage = i;
      const filename = `coming_soon_p${startPage}-${endPage}.json`;
      const filePath = path.join(SAVE_FOLDER, filename);
      fs.writeFileSync(filePath, JSON.stringify(buffer, null, 2));
      console.log(`✅ Saved: ${filePath}`);
      buffer = []; // Reset for next block
    }

    await new Promise(r => setTimeout(r, 1000)); // Delay to reduce server load
  }

  await browser.close();
})();
