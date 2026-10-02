const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const resolveScheduleAccess = async (req) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) return { authenticated: false, subscriber: false, admin: false };

  let decoded;
  try {
    decoded = jwt.verify(authorization.slice(7), process.env.JWT_SECRET || 'bachelor-kitchen-secret');
  } catch {
    throw new Error('Token is invalid or expired');
  }
  const user = await User.findById(decoded.id).select('role');
  if (!user) throw new Error('User not found');
  const admin = user.role === 'admin';
  const subscriber = admin || Boolean(await Subscription.exists({
    user: user._id,
    status: 'active',
    endDate: { $gte: new Date() }
  }));

  return { authenticated: true, subscriber, admin, userId: user._id };
};

module.exports = resolveScheduleAccess;
