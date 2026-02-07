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

    let totalCorrect = 0;
    let totalIncorrect = 0;
    let bonus = 0;
    const topicScores = new Map();
    const sessions = await prisma.session.findMany({
      where: { userId: req.userId },
      include: { quizAttempts: true }
    });
    sessions.forEach((session) => {
      session.quizAttempts.forEach((q) => {
        if (q.isCorrect) totalCorrect += 1;
        else totalIncorrect += 1;
        const key = `${session.id}:${q.topic}`;
        const stat = topicScores.get(key) || { correct: 0, total: 0 };
        stat.total += 1;
        if (q.isCorrect) stat.correct += 1;
        topicScores.set(key, stat);
      });
    });
    topicScores.forEach((stat) => {
      if (stat.total >= 5 && stat.correct === stat.total) {
        bonus += 5;
      }
    });
    const xp = (totalCorrect * 1) + (totalIncorrect * 0.2) + bonus;
    const eruditionLevel = Math.floor(xp / 5) + 1;

    if (req.app.get('io')) {
      req.app.get('io').emit('player-level-updated', {
        userId: req.userId,
        level: eruditionLevel
      });
    }

    res.json({
      sessionId: session.sessionId,
      awarded,
      achievements: achievements.map(a => a.achievementId),
      eruditionLevel
    });
  } catch (error) {
    console.error('Quiz submit error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

module.exports = router;
