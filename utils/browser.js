const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium-min');
const fs = require('fs');

/**
 * Get browser launch options based on environment
 * @returns {Object} Browser launch options
 */
const getBrowserOptions = async () => {
  // Check if we're in a Vercel serverless environment
  const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION;
  
  if (isVercel) {
    await chromium.font();
    return {
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    };
  } else {
    // Local development configuration
    return {
      args: ['--no-sandbox'],
      executablePath: process.env.CHROME_PATH || '/usr/bin/chromium-browser',
      headless: 'new',
    };
  }
};

/**
 * Find Chrome executable in common locations
 * @returns {string} Path to Chrome executable
 */
function findChromePath() {
  const commonPaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser'
  ];
  
  for (const path of commonPaths) {
    if (fs.existsSync(path)) {
      return path;
    }
  }
  
  throw new Error('Chrome executable not found. Please set PUPPETEER_EXECUTABLE_PATH.');
}

module.exports = { getBrowserOptions };