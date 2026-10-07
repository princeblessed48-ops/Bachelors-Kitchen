const express = require('express');
const { body, validationResult } = require('express-validator');
const UserPreference = require('../models/UserPreference');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const preference = await UserPreference.findOne({ user: req.user._id });
  res.json({ success: true, preference: preference || { user: req.user._id, preferredCategory: 'High Protein', allergies: [], customAllergies: [] } });
});

router.put('/', protect, [
  body('preferredCategory').optional().isString(),
  body('allergies').optional().isArray(),
  body('customAllergies').optional().isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

  const now = new Date();
  const existing = await UserPreference.findOne({ user: req.user._id });
  const previous = existing?.preferredCategory || 'High Protein';
  const allowedDate = existing?.nextAllowedPreferenceChange || new Date(0);
  const canChange = now >= allowedDate;

  if (req.body.preferredCategory && req.body.preferredCategory !== previous && !canChange) {
    return res.status(429).json({ success: false, message: 'Preference changes are limited to once per calendar month.' });
  }

  const nextAllowed = new Date(now);
  nextAllowed.setMonth(nextAllowed.getMonth() + 1);

  const preference = await UserPreference.findOneAndUpdate(
    { user: req.user._id },
    {
      user: req.user._id,
      preferredCategory: req.body.preferredCategory || existing?.preferredCategory || 'High Protein',
      allergies: req.body.allergies || existing?.allergies || [],
      customAllergies: req.body.customAllergies || existing?.customAllergies || [],
      lastPreferenceChange: req.body.preferredCategory && req.body.preferredCategory !== previous ? now : existing?.lastPreferenceChange || now,
      nextAllowedPreferenceChange: req.body.preferredCategory && req.body.preferredCategory !== previous ? nextAllowed : existing?.nextAllowedPreferenceChange || null,
      updatedAt: now
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, preference, nextAllowedPreferenceChange: preference.nextAllowedPreferenceChange });
});

module.exports = router;
