const puppeteer = require('puppeteer-core');
const fs = require('fs');

/**
 * Get browser launch options based on environment
 * @returns {Object} Browser launch options
 */
const getBrowserOptions = async () => {
  // Check if running on Vercel
  const isVercel = process.env.VERCEL === '1';
  
  if (isVercel) {
    // For Vercel serverless environment
    let chromium;
    try {
      chromium = require('@sparticuz/chromium-min');
      return {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true
      };
    } catch (err) {
      console.error('Error loading chromium-min in Vercel:', err);
      throw new Error('Failed to initialize browser in serverless environment');
    }
  } else {
    // For local development
    const executablePath = 
      process.env.PUPPETEER_EXECUTABLE_PATH || 
      findChromePath();
      
    return {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 800 },
      executablePath,
      headless: true
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