const Subscription = require('../models/Subscription');

const requireSubscriber = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const activeSubscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active',
      endDate: { $gte: new Date() }
    }).populate('plan');

    if (!activeSubscription) {
      return res.status(403).json({
        success: false,
        message: 'Subscription required to access this content'
      });
    }

    req.subscription = activeSubscription;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to validate subscription' });
  }
};

module.exports = { requireSubscriber };
