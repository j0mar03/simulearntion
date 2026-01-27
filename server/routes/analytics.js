// Analytics Routes
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const prisma = new PrismaClient();

// Submit session analytics
router.post('/', authMiddleware, validate('analyticsSubmit'), async (req, res) => {
  try {
    const {
      sessionId,
      endTime,
      totalDurationSeconds,
      engagementScore,
      totalClicks,
      timePerState,
      quizAttempts,
      stateTransitions,
      topicsStudied
    } = req.body;
    
    // Create session record
    const session = await prisma.session.create({
      data: {
        userId: req.userId,
        sessionId,
        endTime: new Date(endTime),
        engagementScore,
        totalClicks,
        timePerState
      }
    });
    
    // Create quiz attempts
    if (quizAttempts && quizAttempts.length > 0) {
      await prisma.quizAttempt.createMany({
        data: quizAttempts.map(attempt => ({
          userId: req.userId,
          sessionId: session.id,
          question: attempt.question,
          selectedAnswer: attempt.selected,
          correctAnswer: attempt.correct,
          isCorrect: attempt.is_correct,
          topic: attempt.topic,
          answeredAt: new Date(attempt.timestamp * 1000 + new Date(session.startTime).getTime())
        }))
      });
    }
    
    // Create state transitions
    if (stateTransitions && stateTransitions.length > 0) {
      await prisma.stateTransition.createMany({
        data: stateTransitions.map(transition => ({
          sessionId: session.id,
          fromState: transition.from,
          toState: transition.to,
          timeInPrevious: transition.time_in_previous_state,
          transitionedAt: new Date(transition.timestamp * 1000 + new Date(session.startTime).getTime())
        }))
      });
    }
    
    // Record topics studied
    if (topicsStudied && topicsStudied.length > 0) {
      await prisma.topicStudied.createMany({
        data: topicsStudied.map(topic => ({
          userId: req.userId,
          topic
        })),
        skipDuplicates: true
      });
    }
    
    // Update user's total playtime
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        totalPlaytime: {
          increment: Math.floor(totalDurationSeconds)
        }
      }
    });
    
    res.status(201).json({
      message: 'Analytics saved successfully',
      sessionId: session.sessionId
    });
  } catch (error) {
    console.error('Save analytics error:', error);
    res.status(500).json({
      error: 'Failed to save analytics'
    });
  }
});

// Get user analytics summary
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: req.userId },
      include: {
        quizAttempts: true,
        stateTransitions: true
      },
      orderBy: { startTime: 'desc' }
    });
    
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        totalPlaytime: true,
        currentStreak: true,
        achievements: true
      }
    });
    
    // Calculate aggregate stats
    const totalSessions = sessions.length;
    const avgEngagement = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + (s.engagementScore || 0), 0) / sessions.length 
      : 0;
    
    const totalQuizQuestions = sessions.reduce((sum, s) => sum + s.quizAttempts.length, 0);
    const correctAnswers = sessions.reduce((sum, s) => 
      sum + s.quizAttempts.filter(q => q.isCorrect).length, 0);
    
    res.json({
      totalSessions,
      totalPlaytime: user.totalPlaytime,
      avgEngagementScore: Math.round(avgEngagement * 100) / 100,
      currentStreak: user.currentStreak,
      totalQuizQuestions,
      correctAnswers,
      accuracy: totalQuizQuestions > 0 
        ? Math.round((correctAnswers / totalQuizQuestions) * 100 * 100) / 100 
        : 0,
      achievementsEarned: user.achievements.length
    });
  } catch (error) {
    console.error('Get analytics summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics summary'
    });
  }
});

module.exports = router;
