const puppeteer = require('puppeteer');
const { getSteamFollowers } = require('./steam');

// Mock the puppeteer module
jest.mock('puppeteer');

describe('getSteamFollowers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the correct follower count for a given Steam ID', async () => {
    // Mock the implementation of puppeteer
    const mockPage = {
      goto: jest.fn(),
      waitForSelector: jest.fn().mockResolvedValue({
        evaluate: jest.fn().mockResolvedValue('Followers: 1,234,567'),
      }),
      setViewport: jest.fn(),
      setUserAgent: jest.fn(),
      screenshot: jest.fn(),
      close: jest.fn(),
    };
    const mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn(),
    };
    puppeteer.launch.mockResolvedValue(mockBrowser);

    const steamId = '570'; // Dota 2
    const result = await getSteamFollowers(steamId);

    expect(result).toEqual({
      platform: 'Steam',
      url: `https://steamspy.com/app/${steamId}`,
      follower_count: 1234567,
      source: 'Steam Store',
    });
    expect(puppeteer.launch).toHaveBeenCalledTimes(1);
    expect(mockBrowser.newPage).toHaveBeenCalledTimes(1);
    expect(mockPage.goto).toHaveBeenCalledWith(`https://steamspy.com/app/${steamId}`, { waitUntil: 'networkidle2' });
    expect(mockBrowser.close).toHaveBeenCalledTimes(1);
  });

  it('should return null follower count if the text does not contain follower information', async () => {
    // Mock the implementation of puppeteer
    const mockPage = {
      goto: jest.fn(),
      waitForSelector: jest.fn().mockResolvedValue({
        evaluate: jest.fn().mockResolvedValue('Some other text on the page'),
      }),
      setViewport: jest.fn(),
      setUserAgent: jest.fn(),
      screenshot: jest.fn(),
      close: jest.fn(),
    };
    const mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn(),
    };
    puppeteer.launch.mockResolvedValue(mockBrowser);

    const steamId = '570';
    const result = await getSteamFollowers(steamId);

    expect(result).toEqual({
      platform: 'Steam',
      url: `https://steamspy.com/app/${steamId}`,
      follower_count: null,
      source: 'Steam Store',
    });
  });

  it('should handle errors gracefully if puppeteer fails', async () => {
    // Mock puppeteer to throw an error
    puppeteer.launch.mockRejectedValue(new Error('Puppeteer failed to launch'));

    const steamId = '570';
    const result = await getSteamFollowers(steamId);

    expect(result).toEqual({
      platform: 'Steam',
      url: '',
      follower_count: null,
      source: 'Steam Store - Error',
    });
  });
});
