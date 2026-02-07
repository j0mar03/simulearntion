// Quiz Routes
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const AchievementManager = require('../utils/achievement-manager');

const prisma = new PrismaClient();
const achievementManager = new AchievementManager(prisma);

// Submit quiz results
router.post('/submit', authMiddleware, validate('quizSubmit'), async (req, res) => {
  try {
    const { topic, attempts } = req.body;

    const sessionId = `quiz-${req.userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const session = await prisma.session.create({
      data: {
        userId: req.userId,
        sessionId,
        endTime: new Date()
      }
    });

    await prisma.quizAttempt.createMany({
      data: attempts.map((attempt) => ({
        userId: req.userId,
        sessionId: session.id,
        question: attempt.question,
        selectedAnswer: attempt.selectedAnswer,
        correctAnswer: attempt.correctAnswer,
        isCorrect: attempt.isCorrect,
        topic: attempt.topic || topic
      }))
    });

    const awarded = await achievementManager.checkAllAchievements(req.userId);

    const achievements = await prisma.achievement.findMany({
      where: { userId: req.userId },
      select: { achievementId: true }
    });

    res.json({
      sessionId: session.sessionId,
      awarded,
      achievements: achievements.map(a => a.achievementId)
    });
  } catch (error) {
    console.error('Quiz submit error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

module.exports = router;
