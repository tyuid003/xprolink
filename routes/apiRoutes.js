// server/routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const Redirect = require('../models/Redirect');
const shortid = require('shortid');

// --- API for Managing Redirects (CRUD) ---

// GET all redirect configurations
// GET /api/redirects
router.get('/', async (req, res) => {
  try {
    const redirects = await Redirect.find({});
    res.status(200).json(redirects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching redirects.' });
  }
});

// GET a specific redirect configuration by shortCode
// GET /api/redirects/:shortCode
router.get('/:shortCode', async (req, res) => {
  try {
    const redirect = await Redirect.findOne({ shortCode: req.params.shortCode.toLowerCase() });
    if (!redirect) {
      return res.status(404).json({ message: 'Redirect configuration not found.' });
    }
    res.status(200).json(redirect);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching redirect configuration.' });
  }
});

// CREATE a new redirect configuration (new company)
// POST /api/redirects
router.post('/', async (req, res) => {
  const { companyName } = req.body;
  if (!companyName) {
    return res.status(400).json({ message: 'Company name is required.' });
  }

  try {
    const existingRedirect = await Redirect.findOne({ companyName: companyName.toLowerCase() });
    if (existingRedirect) {
      return res.status(409).json({ message: 'Company name already exists.' });
    }

    const newRedirect = new Redirect({
      companyName: companyName,
      shortCode: shortid.generate() // Generate a unique short code for the redirect URL
    });

    await newRedirect.save();
    res.status(201).json(newRedirect);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating redirect configuration.' });
  }
});

// UPDATE an existing redirect configuration (update companyName or add/remove/update target links)
// PUT /api/redirects/:id
router.put('/:id', async (req, res) => {
  const { companyName, targetLinks } = req.body;
  if (!companyName || !Array.isArray(targetLinks)) {
    return res.status(400).json({ message: 'Company name and target links array are required.' });
  }

  try {
    const redirect = await Redirect.findById(req.params.id);
    if (!redirect) {
      return res.status(404).json({ message: 'Redirect configuration not found.' });
    }

    // Check for duplicate companyName if changed
    if (companyName.toLowerCase() !== redirect.companyName && await Redirect.findOne({ companyName: companyName.toLowerCase() })) {
      return res.status(409).json({ message: 'Company name already exists.' });
    }

    redirect.companyName = companyName;
    redirect.targetLinks = targetLinks; // Replace existing links with new array

    await redirect.save();
    res.status(200).json(redirect);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating redirect configuration.' });
  }
});

// DELETE a redirect configuration (delete company)
// DELETE /api/redirects/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await Redirect.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Redirect configuration not found.' });
    }
    res.status(200).json({ message: 'Redirect configuration deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting redirect configuration.' });
  }
});

module.exports = router;