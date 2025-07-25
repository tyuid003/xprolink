// server/routes/goRoutes.js
const express = require('express');
const router = express.Router();
const Redirect = require('../models/Redirect');

// Helper function to get the next active link in a round-robin fashion
const getNextActiveLink = (targetLinks) => {
  const activeLinks = targetLinks.filter(link => link.active);
  if (activeLinks.length === 0) return null;

  let nextLink = activeLinks[0];
  let minHits = activeLinks[0].hits;

  for (let i = 1; i < activeLinks.length; i++) {
    if (activeLinks[i].hits < minHits) {
      minHits = activeLinks[i].hits;
      nextLink = activeLinks[i];
    }
  }
  return nextLink;
};

// Redirect users to the target link
// GET /go/:shortCode (when mounted at /go)
router.get('/:shortCode', async (req, res) => {
  console.log('--- Inside goRoutes.js: Handling /go/:shortCode request ---'); // เพิ่มบรรทัดนี้
  console.log('Requested shortCode:', req.params.shortCode); // เพิ่มบรรทัดนี้

  try {
    const redirect = await Redirect.findOne({ shortCode: req.params.shortCode });

    console.log('Database query result for shortCode:', redirect); // เพิ่มบรรทัดนี้

    if (!redirect) {
      console.log('Redirect not found in DB for shortCode:', req.params.shortCode); // เพิ่มบรรทัดนี้
      return res.status(404).send('Not Found: The requested redirect link does not exist.');
    }

    const nextLink = getNextActiveLink(redirect.targetLinks);

    console.log('Next active link selected:', nextLink); // เพิ่มบรรทัดนี้

    if (!nextLink) {
      console.log('No active target links found for redirect:', redirect.companyName); // เพิ่มบรรทัดนี้
      return res.status(404).send('No active target links available for this redirect.');
    }

    nextLink.hits++;
    await redirect.save();

    console.log('Redirecting to URL:', nextLink.url); // เพิ่มบรรทัดนี้
    res.redirect(302, nextLink.url);
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).send('An error occurred during redirection.');
  }
});

module.exports = router;