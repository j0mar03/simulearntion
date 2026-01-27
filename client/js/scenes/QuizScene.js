// Quiz Scene - Physics Quiz System
class QuizScene extends Phaser.Scene {
  constructor() {
    super({ key: 'QuizScene' });
  }
  
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background - Use real quiz layout image from "Compilations of gokgok simulator 2000"
    const quizBg = this.add.image(0, 0, 'quiz-bg').setOrigin(0);
    quizBg.setDisplaySize(width, height);
    
    // Title
    this.add.text(width / 2, 30, 'Physics Quiz', {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(10);
    
    // Back button - using real asset
    const backBtn = this.add.image(50, 30, 'back-btn');
    backBtn.setScale(0.15); // Much smaller size
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.setDepth(10);
    
    backBtn.on('pointerdown', () => {
      if (this.currentQuestionIndex < QUIZ_QUESTIONS.length) {
        // Confirm before leaving
        const confirmed = confirm('Are you sure you want to leave the quiz? Progress will be saved.');
        if (!confirmed) return;
      }
      this.saveAndExit();
    });
    
    // Quiz state
    this.questions = QUIZ_QUESTIONS;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = 0;
    this.showingFeedback = false;
    this.feedbackTimer = 0;
    
    // Create quiz UI
    this.createQuizUI();
    
    // Display first question
    this.displayQuestion();
    
    // Keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    
    this.lastKeyPress = 0;
  }
  
  createQuizUI() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Question info (question number & score)
    this.infoText = this.add.text(width / 2, 80, '', {
      fontSize: '18px',
      fill: '#000000'
    }).setOrigin(0.5);
    
    // Question text
    this.questionText = this.add.text(width / 2, 140, '', {
      fontSize: '20px',
      fill: '#000000',
      wordWrap: { width: 700 },
      align: 'center'
    }).setOrigin(0.5);
    
    // Answer buttons (2x2 grid)
    this.answerButtons = [];
    this.answerTexts = [];
    
    const buttonPositions = [
      { x: 200, y: 250 },
      { x: 600, y: 250 },
      { x: 200, y: 350 },
      { x: 600, y: 350 }
    ];
    
    buttonPositions.forEach((pos, index) => {
      const btn = this.add.rectangle(pos.x, pos.y, 280, 70, 0xf0f0f0);
      btn.setInteractive({ useHandCursor: true });
      
      btn.on('pointerdown', () => {
        if (!this.showingFeedback) {
          this.selectAnswer(index);
        }
      });
      
      const text = this.add.text(pos.x, pos.y, '', {
        fontSize: '16px',
        fill: '#000000',
        wordWrap: { width: 250 },
        align: 'center'
      }).setOrigin(0.5);
      
      this.answerButtons.push(btn);
      this.answerTexts.push(text);
    });
    
    // Feedback text
    this.feedbackText = this.add.text(width / 2, 480, '', {
      fontSize: '28px',
      fill: '#00aa00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.feedbackText.setVisible(false);
    
    // Instructions
    this.instructionsText = this.add.text(width / 2, 520, 
      'Arrow Keys: Select | ENTER: Submit Answer', {
      fontSize: '14px',
      fill: '#000000',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    
    // Completion UI (hidden initially)
    this.completionUI = null;
  }
  
  displayQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.showCompletion();
      return;
    }
    
    const question = this.questions[this.currentQuestionIndex];
    
    // Update info
    this.infoText.setText(`Question ${this.currentQuestionIndex + 1}/${this.questions.length} | Score: ${this.score}`);
    
    // Update question
    this.questionText.setText(question.q);
    
    // Update answers
    question.options.forEach((option, index) => {
      this.answerTexts[index].setText(option);
    });
    
    // Reset button styles
    this.updateButtonStyles();
    
    // Reset selection
    this.selectedAnswer = 0;
    this.showingFeedback = false;
    this.feedbackText.setVisible(false);
    this.instructionsText.setVisible(true);
  }
  
  updateButtonStyles() {
    this.answerButtons.forEach((btn, index) => {
      if (this.showingFeedback) {
        const question = this.questions[this.currentQuestionIndex];
        
        if (index === question.correct) {
          // Correct answer - green
          btn.setFillStyle(0x90ee90);
        } else if (index === this.selectedAnswer && index !== question.correct) {
          // Wrong selection - red
          btn.setFillStyle(0xff6b6b);
        } else {
          // Default
          btn.setFillStyle(0xf0f0f0);
        }
      } else {
        if (index === this.selectedAnswer) {
          // Selected - yellow highlight
          btn.setFillStyle(0xffff99);
        } else {
          // Default
          btn.setFillStyle(0xf0f0f0);
        }
      }
    });
  }
  
  selectAnswer(index) {
    if (this.showingFeedback) return;
    
    this.selectedAnswer = index;
    this.updateButtonStyles();
  }
  
  submitAnswer() {
    if (this.showingFeedback) return;
    if (this.currentQuestionIndex >= this.questions.length) return;
    
    const question = this.questions[this.currentQuestionIndex];
    const isCorrect = this.selectedAnswer === question.correct;
    
    if (isCorrect) {
      this.score++;
      this.feedbackText.setText('CORRECT!');
      this.feedbackText.setColor('#00aa00');
    } else {
      this.feedbackText.setText('WRONG!');
      this.feedbackText.setColor('#ff0000');
    }
    
    this.showingFeedback = true;
    this.feedbackText.setVisible(true);
    this.instructionsText.setVisible(false);
    this.updateButtonStyles();
    
    // Notify server
    socketManager.submitQuizAnswer(this.currentQuestionIndex, isCorrect, this.score);
    
    // Auto-advance after 1 second
    this.time.delayedCall(1000, () => {
      this.currentQuestionIndex++;
      this.displayQuestion();
    });
  }
  
  update(time, delta) {
    // Keyboard navigation
    const now = time;
    
    if (!this.showingFeedback && this.currentQuestionIndex < this.questions.length) {
      if (now - this.lastKeyPress > 200) {
        if (this.cursors.up.isDown) {
          this.selectedAnswer = (this.selectedAnswer - 2 + 4) % 4;
          this.updateButtonStyles();
          this.lastKeyPress = now;
        } else if (this.cursors.down.isDown) {
          this.selectedAnswer = (this.selectedAnswer + 2) % 4;
          this.updateButtonStyles();
          this.lastKeyPress = now;
        } else if (this.cursors.left.isDown) {
          this.selectedAnswer = (this.selectedAnswer - 1 + 4) % 4;
          this.updateButtonStyles();
          this.lastKeyPress = now;
        } else if (this.cursors.right.isDown) {
          this.selectedAnswer = (this.selectedAnswer + 1) % 4;
          this.updateButtonStyles();
          this.lastKeyPress = now;
        }
      }
    }
    
    // Submit answer with Enter
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      if (!this.showingFeedback && this.currentQuestionIndex < this.questions.length) {
        this.submitAnswer();
      } else if (this.currentQuestionIndex >= this.questions.length && this.completionUI) {
        // Restart quiz
        this.restartQuiz();
      }
    }
  }
  
  showCompletion() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Hide question UI
    this.infoText.setVisible(false);
    this.questionText.setVisible(false);
    this.answerButtons.forEach(btn => btn.setVisible(false));
    this.answerTexts.forEach(text => text.setVisible(false));
    this.feedbackText.setVisible(false);
    this.instructionsText.setVisible(false);
    
    // Calculate percentage
    const percentage = (this.score / this.questions.length) * 100;
    
    // Create completion UI
    this.completionUI = this.add.container(width / 2, height / 2);
    
    const title = this.add.text(0, -100, 'Quiz Complete!', {
      fontSize: '36px',
      fill: '#00aa00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const scoreText = this.add.text(0, -30, 
      `Score: ${this.score}/${this.questions.length} (${percentage.toFixed(1)}%)`, {
      fontSize: '24px',
      fill: '#000000'
    }).setOrigin(0.5);
    
    let message;
    if (percentage >= 80) {
      message = 'Excellent work! 🌟';
    } else if (percentage >= 60) {
      message = 'Good job! Keep practicing!';
    } else {
      message = 'Keep studying! You\'ll improve!';
    }
    
    const messageText = this.add.text(0, 30, message, {
      fontSize: '20px',
      fill: '#667eea'
    }).setOrigin(0.5);
    
    const restartBtn = this.add.rectangle(0, 100, 200, 50, 0x667eea);
    restartBtn.setInteractive({ useHandCursor: true });
    const restartText = this.add.text(0, 100, 'Restart Quiz', {
      fontSize: '18px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    restartBtn.on('pointerdown', () => {
      this.restartQuiz();
    });
    
    this.completionUI.add([title, scoreText, messageText, restartBtn, restartText]);
    
    // Save quiz results
    this.saveQuizResults();
  }
  
  restartQuiz() {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = 0;
    
    if (this.completionUI) {
      this.completionUI.destroy();
      this.completionUI = null;
    }
    
    // Show question UI
    this.infoText.setVisible(true);
    this.questionText.setVisible(true);
    this.answerButtons.forEach(btn => btn.setVisible(true));
    this.answerTexts.forEach(text => text.setVisible(true));
    this.instructionsText.setVisible(true);
    
    this.displayQuestion();
  }
  
  async saveQuizResults() {
    // Submit analytics to server
    const token = localStorage.getItem('token');
    
    // This would typically save full session data
    // For now, just log completion
    console.log('Quiz completed:', this.score, '/', this.questions.length);
  }
  
  saveAndExit() {
    // Save progress and return to library
    this.scene.start('LibraryScene');
  }
}
