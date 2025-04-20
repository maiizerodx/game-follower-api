const express = require('express');
const router = express.Router();

const { getTwitterFollowers } = require('../scrapers/twitter');
const { getSteamFollowers } = require('../scrapers/steam');
const { getRedditFollowers } = require('../scrapers/reddit');
const { getFacebookFollowers } = require('../scrapers/facebook');

// router.get('/', async (req, res) => {
//   const { game, developer } = req.query;

//   const [twitter, steam, reddit, facebook] = await Promise.all([
//     // getTwitterFollowers(game, developer),
//     // getSteamFollowers(game, developer),
//     getRedditFollowers(game, developer),
//     // getFacebookFollowers(game, developer)
//   ]);

//   res.json({
//     game,
//     developer,
//     social_media: { Twitter: twitter, Steam: steam, Reddit: reddit, Facebook: facebook }
//   });
// });

// Route to get followers for a specific platform 
// by specifying the platform name and account name

router.get('/:platform', async (req, res) => {
  const { account } = req.query;
  const { platform } = req.params;

  let followers;

  switch (platform.toLowerCase()) {
    case 'twitter':
      followers = await getTwitterFollowers(account);
      break;
    case 'steam':
      followers = await getSteamFollowers(account);
      break;
    case 'reddit':
      followers = await getRedditFollowers(account);
      break;
    case 'facebook':
      followers = await getFacebookFollowers(account);
      break;
    default:
      return res.status(400).json({ error: 'Invalid platform specified' });
  }

  res.json(followers);
});

module.exports = router;
