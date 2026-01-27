// Achievement Manager
// Ported from main.py AchievementSystem class

const achievements = {
  // Topic Mastery Badges
  kinematics_master: {
    name: 'Kinematics Master',
    description: 'Study Kinematics topic',
    icon: '🎯',
    type: 'topic',
    unlocks: 'halo'
  },
  dynamics_master: {
    name: 'Dynamics Master',
    description: 'Study Dynamics topic',
    icon: '⚡',
    type: 'topic',
    unlocks: 'sun'
  },
  energy_master: {
    name: 'Energy Master',
    description: 'Study Work & Energy topic',
    icon: '💫',
    type: 'topic',
    unlocks: null
  },
  
  // Quiz Performance Badges
  first_quiz: {
    name: 'Quiz Rookie',
    description: 'Complete your first quiz',
    icon: '📝',
    type: 'quiz',
    unlocks: null
  },
  quiz_ace: {
    name: 'Quiz Ace',
    description: 'Score 80% or higher on any quiz',
    icon: '🌟',
    type: 'quiz',
    unlocks: 'scarf'
  },
  perfect_score: {
    name: 'Perfect Score',
    description: 'Score 100% on a quiz',
    icon: '👑',
    type: 'quiz',
    unlocks: 'u2'
  },
  quiz_master: {
    name: 'Quiz Master',
    description: 'Complete 10 quizzes',
    icon: '🏆',
    type: 'quiz',
    unlocks: 'cape'
  },
  
  // Streak Badges
  streak_3: {
    name: '3-Day Streak',
    description: 'Study for 3 days in a row',
    icon: '🔥',
    type: 'streak',
    unlocks: null
  },
  streak_7: {
    name: '1-Week Streak',
    description: 'Study for 7 days in a row',
    icon: '🔥🔥',
    type: 'streak',
    unlocks: null
  },
  streak_30: {
    name: '1-Month Streak',
    description: 'Study for 30 days in a row',
    icon: '🔥🔥🔥',
    type: 'streak',
    unlocks: 'halo'
  },
  
  // Engagement Badges
  customizer: {
    name: 'Customizer',
    description: 'Customize your avatar',
    icon: '🎨',
    type: 'engagement',
    unlocks: null
  },
  explorer: {
    name: 'Explorer',
    description: 'Visit all areas of the game',
    icon: '🗺️',
    type: 'engagement',
    unlocks: null
  },
  dedicated_learner: {
    name: 'Dedicated Learner',
    description: 'Spend 1 hour total in game',
    icon: '📚',
    type: 'engagement',
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
    
    // Check topic achievements
    if (achievement.type === 'topic') {
      const topicsStudiedList = user.topicsStudied.map(t => t.topic);
      
      if (achievementId === 'kinematics_master') {
        earned = topicsStudiedList.includes('Kinematics');
      } else if (achievementId === 'dynamics_master') {
        earned = topicsStudiedList.includes('Dynamics');
      } else if (achievementId === 'energy_master') {
        earned = topicsStudiedList.includes('Work & Energy');
      }
    }
    
    // Check quiz achievements
    else if (achievement.type === 'quiz') {
      const quizCount = user.sessions.length;
      
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
      
      if (achievementId === 'first_quiz') {
        earned = quizCount >= 1;
      } else if (achievementId === 'quiz_ace') {
        earned = bestScore >= 80;
      } else if (achievementId === 'perfect_score') {
        earned = bestScore >= 100;
      } else if (achievementId === 'quiz_master') {
        earned = quizCount >= 10;
      }
    }
    
    // Check streak achievements
    else if (achievement.type === 'streak') {
      const currentStreak = user.currentStreak;
      
      if (achievementId === 'streak_3') {
        earned = currentStreak >= 3;
      } else if (achievementId === 'streak_7') {
        earned = currentStreak >= 7;
      } else if (achievementId === 'streak_30') {
        earned = currentStreak >= 30;
      }
    }
    
    // Check engagement achievements
    else if (achievement.type === 'engagement') {
      if (achievementId === 'customizer') {
        // Check if avatar is different from default
        const avatarConfig = user.avatarConfig;
        earned = avatarConfig.body !== 'u1' || avatarConfig.head !== 'none';
      } else if (achievementId === 'explorer') {
        // Check if visited all main areas (3+)
        const statesVisited = new Set();
        for (const session of user.sessions) {
          const timePerState = session.timePerState;
          Object.keys(timePerState).forEach(state => statesVisited.add(state));
        }
        earned = statesVisited.size >= 3;
      } else if (achievementId === 'dedicated_learner') {
        earned = user.totalPlaytime >= 3600; // 1 hour
      }
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
