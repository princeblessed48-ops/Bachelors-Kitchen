const express = require('express');
const { body, validationResult } = require('express-validator');
const { calculateDeliveryFee } = require('../utils/deliveryPricingService');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/calculate', protect, [
  body('distanceKm').isNumeric().withMessage('Distance is required'),
  body('zone').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  try {
    const result = calculateDeliveryFee({
      distanceKm: req.body.distanceKm,
      express: Boolean(req.body.express),
      zone: req.body.zone || 'A',
      baseFee: req.body.baseFee,
      pricePerKm: req.body.pricePerKm,
      expressFee: req.body.expressFee,
      minimumFee: req.body.minimumFee,
      maximumDistance: req.body.maximumDistance,
    });

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
