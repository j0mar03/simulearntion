// Analytics Tracker Utility
// Ported from main.py AnalyticsTracker class

class AnalyticsTracker {
  constructor(userId, sessionId) {
    this.userId = userId;
    this.sessionId = sessionId;
    this.sessionStart = Date.now();
    this.sessionData = {
      sessionId,
      userId,
      startTime: new Date().toISOString(),
      interactions: [],
      stateTransitions: [],
      quizAttempts: [],
      timePerState: {},
      avatarChanges: 0,
      topicsStudied: [],
      totalClicks: 0,
      quizPerformance: {
        totalQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        topicsPerformance: {}
      }
    };
    this.currentStateStart = Date.now();
    this.currentState = null;
  }
  
  logInteraction(eventType, details = {}) {
    const interaction = {
      timestamp: (Date.now() - this.sessionStart) / 1000,
      datetime: new Date().toISOString(),
      type: eventType,
      details
    };
    
    this.sessionData.interactions.push(interaction);
    
    if (eventType === 'click') {
      this.sessionData.totalClicks++;
    }
  }
  
  logStateChange(oldState, newState) {
    const currentTime = Date.now();
    const timeSpent = (currentTime - this.currentStateStart) / 1000;
    
    // Update time per state
    if (oldState) {
      if (!this.sessionData.timePerState[oldState]) {
        this.sessionData.timePerState[oldState] = 0;
      }
      this.sessionData.timePerState[oldState] += timeSpent;
    }
    
    // Log transition
    this.sessionData.stateTransitions.push({
      from: oldState,
      to: newState,
      timestamp: (currentTime - this.sessionStart) / 1000,
      time_in_previous_state: timeSpent
    });
    
    this.currentState = newState;
    this.currentStateStart = currentTime;
  }
  
  logQuizAttempt(question, selectedAnswer, correctAnswer, isCorrect, topic) {
    const attempt = {
      timestamp: (Date.now() - this.sessionStart) / 1000,
      question,
      selected: selectedAnswer,
      correct: correctAnswer,
      is_correct: isCorrect,
      topic
    };
    
    this.sessionData.quizAttempts.push(attempt);
    
    // Update performance stats
    const perf = this.sessionData.quizPerformance;
    perf.totalQuestions++;
    
    if (isCorrect) {
      perf.correctAnswers++;
    } else {
      perf.wrongAnswers++;
    }
    
    // Track performance by topic
    if (!perf.topicsPerformance[topic]) {
      perf.topicsPerformance[topic] = { correct: 0, total: 0 };
    }
    perf.topicsPerformance[topic].total++;
    if (isCorrect) {
      perf.topicsPerformance[topic].correct++;
    }
  }
  
  logTopicStudied(topic) {
    if (!this.sessionData.topicsStudied.includes(topic)) {
      this.sessionData.topicsStudied.push(topic);
      this.logInteraction('topic_studied', { topic });
    }
  }
  
  logAvatarChange(itemType, itemValue) {
    this.sessionData.avatarChanges++;
    this.logInteraction('avatar_customization', { type: itemType, value: itemValue });
  }
  
  calculateEngagementScore() {
    let score = 0;
    
    // Time-based engagement (max 30 points)
    const totalTime = (Date.now() - this.sessionStart) / 1000;
    if (totalTime > 0) {
      score += Math.min(30, (totalTime / 600) * 30); // 10 minutes = max points
    }
    
    // Interaction frequency (max 25 points)
    if (totalTime > 0) {
      const interactionsPerMinute = (this.sessionData.totalClicks / totalTime) * 60;
      score += Math.min(25, interactionsPerMinute * 5);
    }
    
    // Quiz participation (max 25 points)
    const quizPerf = this.sessionData.quizPerformance;
    if (quizPerf.totalQuestions > 0) {
      const accuracy = quizPerf.correctAnswers / quizPerf.totalQuestions;
      score += accuracy * 25;
    }
    
    // Exploration (max 20 points)
    const statesVisited = Object.keys(this.sessionData.timePerState).length;
    const topicsStudied = this.sessionData.topicsStudied.length;
    score += Math.min(20, (statesVisited * 5) + (topicsStudied * 3));
    
    return Math.min(100, Math.round(score * 100) / 100);
  }
  
  getSessionData() {
    // Finalize session data
    const endTime = new Date();
    const totalDuration = (Date.now() - this.sessionStart) / 1000;
    const engagementScore = this.calculateEngagementScore();
    
    return {
      ...this.sessionData,
      endTime: endTime.toISOString(),
      totalDurationSeconds: totalDuration,
      engagementScore
    };
  }
  
  getSummary() {
    const perf = this.sessionData.quizPerformance;
    const totalTime = (Date.now() - this.sessionStart) / 1000;
    
    return {
      duration: `${(totalTime / 60).toFixed(1)} minutes`,
      totalInteractions: this.sessionData.totalClicks,
      statesVisited: Object.keys(this.sessionData.timePerState).length,
      topicsStudied: this.sessionData.topicsStudied.length,
      quizQuestionsAnswered: perf.totalQuestions,
      quizAccuracy: perf.totalQuestions > 0
        ? `${((perf.correctAnswers / perf.totalQuestions) * 100).toFixed(1)}%`
        : 'N/A',
      engagementScore: `${this.calculateEngagementScore().toFixed(1)}/100`
    };
  }
}

module.exports = AnalyticsTracker;
