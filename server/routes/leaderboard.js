// Leaderboard Routes
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get top players by quiz performance
router.get('/quiz', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get users with their quiz stats
    const quizStats = await prisma.quizAttempt.groupBy({
      by: ['userId'],
      _count: {
        _all: true
      },
      _sum: {
        isCorrect: true
      },
      orderBy: {
        _sum: {
          isCorrect: 'desc'
        }
      },
      take: limit
    });
    
    // Get user details for top performers
    const userIds = quizStats.map(stat => stat.userId);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        username: true,
        avatarConfig: true
      }
    });
    
    // Combine stats with user info
    const leaderboard = quizStats.map(stat => {
      const user = users.find(u => u.id === stat.userId);
      const totalQuestions = stat._count._all;
      const correctAnswers = stat._sum.isCorrect || 0;
      const accuracy = totalQuestions > 0 
        ? Math.round((correctAnswers / totalQuestions) * 100 * 100) / 100 
        : 0;
      
      return {
        userId: stat.userId,
        username: user?.username || 'Unknown',
        avatarConfig: user?.avatarConfig,
        totalQuestions,
        correctAnswers,
        accuracy,
        score: correctAnswers
      };
    });
    
    res.json({ leaderboard });
  } catch (error) {
    console.error('Get quiz leaderboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch leaderboard'
    });
  }
});

// Get top players by engagement score
router.get('/engagement', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get users with highest average engagement scores
    const engagementStats = await prisma.session.groupBy({
      by: ['userId'],
      _avg: {
        engagementScore: true
      },
      _count: {
        _all: true
      },
      orderBy: {
        _avg: {
          engagementScore: 'desc'
        }
      },
      take: limit
    });
    
    // Get user details
    const userIds = engagementStats.map(stat => stat.userId);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        username: true,
        avatarConfig: true,
        currentStreak: true
      }
    });
    
    // Combine stats with user info
    const leaderboard = engagementStats.map(stat => {
      const user = users.find(u => u.id === stat.userId);
      
      return {
        userId: stat.userId,
        username: user?.username || 'Unknown',
        avatarConfig: user?.avatarConfig,
        avgEngagementScore: Math.round((stat._avg.engagementScore || 0) * 100) / 100,
        sessionsPlayed: stat._count._all,
        currentStreak: user?.currentStreak || 0
      };
    });
    
    res.json({ leaderboard });
  } catch (error) {
    console.error('Get engagement leaderboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch leaderboard'
    });
  }
});

// Get top players by achievements
router.get('/achievements', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get users with most achievements
    const achievementStats = await prisma.achievement.groupBy({
      by: ['userId'],
      _count: {
        _all: true
      },
      orderBy: {
        _count: {
          _all: 'desc'
        }
      },
      take: limit
    });
    
    // Get user details
    const userIds = achievementStats.map(stat => stat.userId);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        username: true,
        avatarConfig: true
      }
    });
    
    // Combine stats with user info
    const leaderboard = achievementStats.map(stat => {
      const user = users.find(u => u.id === stat.userId);
      
      return {
        userId: stat.userId,
        username: user?.username || 'Unknown',
        avatarConfig: user?.avatarConfig,
        achievementCount: stat._count._all
      };
    });
    
    res.json({ leaderboard });
  } catch (error) {
    console.error('Get achievements leaderboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch leaderboard'
    });
  }
});

module.exports = router;
