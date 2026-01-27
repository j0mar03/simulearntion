// Profile Routes
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const prisma = new PrismaClient();
const AchievementManager = require('../utils/achievement-manager');
const achievementManager = new AchievementManager(prisma);

// Get user profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatarConfig: true,
        currentStreak: true,
        totalPlaytime: true,
        lastPlayDate: true,
        isAdmin: true,
        createdAt: true,
        lastLogin: true,
        achievements: {
          select: {
            achievementId: true,
            earnedAt: true
          }
        },
        topicsStudied: {
          select: {
            topic: true,
            studiedAt: true
          },
          distinct: ['topic']
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    // Get quiz statistics
    const totalQuizzes = await prisma.quizAttempt.count({
      where: { userId: req.userId }
    });
    
    const correctAnswers = await prisma.quizAttempt.count({
      where: { 
        userId: req.userId,
        isCorrect: true
      }
    });
    
    const stats = {
      totalQuizzes,
      correctAnswers,
      wrongAnswers: totalQuizzes - correctAnswers
    };
    
    // Get best score
    const sessions = await prisma.session.findMany({
      where: { userId: req.userId },
      orderBy: { engagementScore: 'desc' },
      take: 1,
      select: { engagementScore: true }
    });
    
    // Get unlock status for avatar items
    const unlockedItems = {
      'u1': true, // Always unlocked
      'u2': achievementManager.isItemUnlocked('u2', user.achievements, user.isAdmin),
      'cape': achievementManager.isItemUnlocked('cape', user.achievements, user.isAdmin),
      'scarf': achievementManager.isItemUnlocked('scarf', user.achievements, user.isAdmin),
      'cat': true, // Always unlocked
      'flower': true, // Always unlocked
      'halo': achievementManager.isItemUnlocked('halo', user.achievements, user.isAdmin),
      'sun': achievementManager.isItemUnlocked('sun', user.achievements, user.isAdmin),
      'none': true // Always unlocked
    };
    
    res.json({
      ...user,
      unlockedItems,
      stats: {
        totalQuizzes: stats.totalQuizzes,
        correctAnswers: stats.correctAnswers,
        wrongAnswers: stats.wrongAnswers,
        bestEngagementScore: sessions[0]?.engagementScore || 0
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile'
    });
  }
});

// Update profile (avatar customization)
router.put('/', authMiddleware, validate('updateProfile'), async (req, res) => {
  try {
    const { avatarConfig } = req.body;
    
    // Validate avatarConfig structure
    if (!avatarConfig || typeof avatarConfig !== 'object') {
      return res.status(400).json({
        error: 'Invalid avatar configuration'
      });
    }
    
    // Get user with achievements and admin status
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        isAdmin: true,
        achievements: {
          select: {
            achievementId: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    // Validate that user has access to the items they're trying to use
    const body = avatarConfig.body || 'u1';
    const head = avatarConfig.head || 'none';
    
    // Check body item unlock status
    const bodyUnlocked = achievementManager.isItemUnlocked(body, user.achievements, user.isAdmin);
    if (!bodyUnlocked) {
      return res.status(403).json({
        error: `You don't have access to ${body}. Unlock it through achievements first.`
      });
    }
    
    // Check head item unlock status
    const headUnlocked = achievementManager.isItemUnlocked(head, user.achievements, user.isAdmin);
    if (!headUnlocked) {
      return res.status(403).json({
        error: `You don't have access to ${head}. Unlock it through achievements first.`
      });
    }
    
    // Update avatar config if validation passes
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        avatarConfig
      },
      select: {
        id: true,
        username: true,
        avatarConfig: true
      }
    });
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile'
    });
  }
});

// Get quiz history
router.get('/quiz-history', authMiddleware, async (req, res) => {
  try {
    const history = await prisma.session.findMany({
      where: { userId: req.userId },
      include: {
        quizAttempts: {
          select: {
            question: true,
            selectedAnswer: true,
            correctAnswer: true,
            isCorrect: true,
            topic: true,
            answeredAt: true
          }
        }
      },
      orderBy: { startTime: 'desc' },
      take: 20
    });
    
    res.json({ history });
  } catch (error) {
    console.error('Get quiz history error:', error);
    res.status(500).json({
      error: 'Failed to fetch quiz history'
    });
  }
});

// Get achievements
router.get('/achievements', authMiddleware, async (req, res) => {
  try {
    // Get user to check admin status
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { isAdmin: true }
    });
    
    // If admin, return all achievements as earned
    if (user && user.isAdmin) {
      const allAchievementIds = Object.keys(achievementManager.achievements);
      const allAchievements = allAchievementIds.map(achievementId => ({
        userId: req.userId,
        achievementId,
        earnedAt: new Date() // Use current date for admin
      }));
      
      return res.json({ achievements: allAchievements });
    }
    
    // Otherwise, return only earned achievements
    const achievements = await prisma.achievement.findMany({
      where: { userId: req.userId },
      orderBy: { earnedAt: 'desc' }
    });
    
    res.json({ achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      error: 'Failed to fetch achievements'
    });
  }
});

module.exports = router;
