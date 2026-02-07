// Achievement Routes
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const AchievementManager = require('../utils/achievement-manager');

const prisma = new PrismaClient();
const achievementManager = new AchievementManager(prisma);

// Award an achievement manually (e.g., tutorial completion)
router.post('/award', authMiddleware, validate('awardAchievement'), async (req, res) => {
  try {
    const { achievementId } = req.body;
    const allowed = ['trailblazer'];
    if (!allowed.includes(achievementId)) {
      return res.status(400).json({ error: 'Achievement not allowed' });
    }

    const awarded = await achievementManager.awardAchievement(achievementId, req.userId);

    const achievements = await prisma.achievement.findMany({
      where: { userId: req.userId },
      select: { achievementId: true }
    });

    res.json({
      awarded: awarded ? [{ id: achievementId, name: achievementManager.achievements[achievementId]?.name }] : [],
      achievements: achievements.map(a => a.achievementId)
    });
  } catch (error) {
    console.error('Award achievement error:', error);
    res.status(500).json({ error: 'Failed to award achievement' });
  }
});

module.exports = router;
