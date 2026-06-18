const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const schoolRoutes = require('./schoolRoutes');
const activityRoutes = require('./activityRoutes');
const mediaRoutes = require('./mediaRoutes');
const rankingRoutes = require('./rankingRoutes');
const notificationRoutes = require('./notificationRoutes');
const inspectionRoutes = require('./inspectionRoutes');
const recommendationRoutes = require('./recommendationRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const securityRoutes = require('./securityRoutes');
const messageRoutes = require('./messageRoutes');

// Mount routes to align with exact prompt endpoints
router.use('/auth', authRoutes);
router.use('/', schoolRoutes); // Exposes CRUD states, districts, schools, onboarding approvals
router.use('/', activityRoutes); // Exposes activities and achievements
router.use('/media', mediaRoutes);
router.use('/rankings', rankingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/inspection', inspectionRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/security', securityRoutes);
router.use('/messages', messageRoutes);

module.exports = router;
