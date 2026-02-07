// Achievement Manager
// Ported from main.py AchievementSystem class

const achievements = {
  freshman: {
    name: 'Freshman',
    description: 'Reach Erudition Level 5',
    type: 'erudition',
    unlocks: 'u2'
  },
  engaged_rookie: {
    name: 'Engaged Rookie',
    description: 'Reach Erudition Level 10',
    type: 'erudition',
    unlocks: 'cape'
  },
  seasoned_learner: {
    name: 'Seasoned Learner',
    description: 'Reach Erudition Level 15',
    type: 'erudition',
    unlocks: 'scarf'
  },
  physicist: {
    name: 'Physicist',
    description: 'Score 90%+ on a Physics quiz',
    type: 'quiz',
    unlocks: 'halo'
  },
  an_enthusiast: {
    name: 'An Enthusiast!',
    description: 'Play for at least 3 days',
    type: 'days',
    unlocks: 'sun'
  },
  trailblazer: {
    name: 'The Trailblazer',
    description: 'Participated in prototype testing',
    type: 'tutorial',
    unlocks: null
  }
};

class AchievementManager {
  constructor(prisma) {
    this.prisma = prisma;
    this.achievements = achievements;
  }
  
  async checkAchievement(achievementId, userId) {
    // Check if already earned
    const existing = await this.prisma.achievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId
        }
      }
    });
    
    if (existing) {
      return false; // Already earned
    }
    
    const achievement = this.achievements[achievementId];
    if (!achievement) {
      return false;
    }
    
    let earned = false;
    
    // Get user data
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        topicsStudied: true,
        sessions: {
          include: {
            quizAttempts: true
          }
        },
        achievements: true
      }
    });
    
    // Check erudition achievements (based on XP derived from quiz attempts)
    if (achievement.type === 'erudition') {
      let totalCorrect = 0;
      let totalIncorrect = 0;
      let bonus = 0;
      const topicScores = new Map();
      user.sessions.forEach((session) => {
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
      if (achievementId === 'freshman') {
        earned = eruditionLevel >= 5;
      } else if (achievementId === 'engaged_rookie') {
        earned = eruditionLevel >= 10;
      } else if (achievementId === 'seasoned_learner') {
        earned = eruditionLevel >= 15;
      }
    }
    
    // Check quiz achievements
    else if (achievement.type === 'quiz') {
      // Calculate best score (by session)
      let bestScore = 0;
      for (const session of user.sessions) {
        if (session.quizAttempts.length > 0) {
          const correct = session.quizAttempts.filter(q => q.isCorrect).length;
          const total = session.quizAttempts.length;
          const percentage = (correct / total) * 100;
          bestScore = Math.max(bestScore, percentage);
        }
      }
      
      if (achievementId === 'physicist') {
        earned = bestScore >= 90;
      }
    }
    
    // Check days played achievements
    else if (achievement.type === 'days') {
      const uniqueDays = new Set();
      for (const session of user.sessions) {
        const date = new Date(session.startTime);
        const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
        uniqueDays.add(key);
      }
      if (achievementId === 'an_enthusiast') {
        earned = uniqueDays.size >= 3;
      }
    }
    
    // Tutorial achievements are awarded manually
    else if (achievement.type === 'tutorial') {
      earned = false;
    }
    
    return earned;
  }
  
  async awardAchievement(achievementId, userId) {
    try {
      // Check if already earned
      const existing = await this.prisma.achievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId
          }
        }
      });
      
      if (existing) {
        return false; // Already earned
      }
      
      // Award achievement
      await this.prisma.achievement.create({
        data: {
          userId,
          achievementId
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return false;
    }
  }
  
  async checkAllAchievements(userId) {
    const newlyEarned = [];
    
    for (const achievementId of Object.keys(this.achievements)) {
      const earned = await this.checkAchievement(achievementId, userId);
      
      if (earned) {
        const awarded = await this.awardAchievement(achievementId, userId);
        if (awarded) {
          newlyEarned.push({
            id: achievementId,
            ...this.achievements[achievementId]
          });
        }
      }
    }
    
    return newlyEarned;
  }
  
  isItemUnlocked(itemId, userAchievements, isAdmin = false) {
    // Admin users have all items unlocked
    if (isAdmin) {
      return true;
    }
    
    // Default items always unlocked
    const defaultItems = ['none', 'u1', 'cat', 'flower'];
    if (defaultItems.includes(itemId)) {
      return true;
    }
    
    // Check if any achievement unlocks this item
    for (const achievement of userAchievements) {
      const achievementData = this.achievements[achievement.achievementId];
      if (achievementData && achievementData.unlocks === itemId) {
        return true;
      }
    }
    
    return false;
  }
  
  async updateStreak(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (user.lastPlayDate) {
      const lastPlayDate = new Date(user.lastPlayDate);
      lastPlayDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today - lastPlayDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Already played today
        return user.currentStreak;
      } else if (daysDiff === 1) {
        // Consecutive day
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            currentStreak: user.currentStreak + 1,
            lastPlayDate: today
          }
        });
        return user.currentStreak + 1;
      } else {
        // Streak broken
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            currentStreak: 1,
            lastPlayDate: today
          }
        });
        return 1;
      }
    } else {
      // First play
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: 1,
          lastPlayDate: today
        }
      });
      return 1;
    }
  }
}

module.exports = AchievementManager;
