// Shared Constants between Client and Server

const QUIZ_QUESTIONS = [
  // Kinematics Questions
  {
    q: "What is the acceleration due to gravity on Earth?",
    options: ["4.9 m/s²", "9.8 m/s²", "1.6 m/s²", "12.0 m/s²"],
    correct: 1,
    topic: "Kinematics"
  },
  {
    q: "A car travels 100m in 5 seconds. What is its average velocity?",
    options: ["10 m/s", "20 m/s", "25 m/s", "30 m/s"],
    correct: 1,
    topic: "Kinematics"
  },
  {
    q: "If an object starts from rest and accelerates at 2 m/s² for 5 seconds, what is its final velocity?",
    options: ["5 m/s", "10 m/s", "15 m/s", "20 m/s"],
    correct: 1,
    topic: "Kinematics"
  },
  {
    q: "What does the slope of a velocity-time graph represent?",
    options: ["Distance", "Speed", "Acceleration", "Displacement"],
    correct: 2,
    topic: "Kinematics"
  },
  {
    q: "An object is thrown upward. At the highest point, its velocity is:",
    options: ["Maximum", "Zero", "Negative", "Constant"],
    correct: 1,
    topic: "Kinematics"
  },
  {
    q: "What is the formula for average velocity?",
    options: ["v = d/t", "v = a*t", "v = F/m", "v = m*a"],
    correct: 0,
    topic: "Kinematics"
  },
  {
    q: "A ball is dropped from rest. After 3 seconds, how far has it fallen? (use g=10m/s²)",
    options: ["30 m", "45 m", "60 m", "90 m"],
    correct: 1,
    topic: "Kinematics"
  },
  
  // Dynamics Questions
  {
    q: "Which law states that F = ma?",
    options: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Ohm's Law"],
    correct: 1,
    topic: "Dynamics"
  },
  {
    q: "What is the unit of Force?",
    options: ["Joule", "Watt", "Newton", "Pascal"],
    correct: 2,
    topic: "Dynamics"
  },
  {
    q: "Newton's Third Law states that:",
    options: ["F = ma", "Objects at rest stay at rest", "For every action, there's an equal and opposite reaction", "Energy is conserved"],
    correct: 2,
    topic: "Dynamics"
  },
  {
    q: "A 5kg object experiences a net force of 20N. What is its acceleration?",
    options: ["2 m/s²", "4 m/s²", "15 m/s²", "25 m/s²"],
    correct: 1,
    topic: "Dynamics"
  },
  {
    q: "What is the formula for weight?",
    options: ["w = m/g", "w = m*g", "w = F*d", "w = m*v"],
    correct: 1,
    topic: "Dynamics"
  },
  {
    q: "Friction always acts in which direction?",
    options: ["Direction of motion", "Opposite to motion", "Perpendicular to motion", "Random direction"],
    correct: 1,
    topic: "Dynamics"
  },
  {
    q: "If the net force on an object is zero, the object is:",
    options: ["Accelerating", "In equilibrium", "Falling", "Rotating"],
    correct: 1,
    topic: "Dynamics"
  },
  {
    q: "What type of force causes circular motion?",
    options: ["Gravitational", "Centripetal", "Frictional", "Tensional"],
    correct: 1,
    topic: "Dynamics"
  },
  
  // Work & Energy Questions
  {
    q: "Energy of motion is called _____ energy.",
    options: ["Potential", "Kinetic", "Thermal", "Chemical"],
    correct: 1,
    topic: "Work & Energy"
  },
  {
    q: "What is the formula for work?",
    options: ["W = F*d", "W = m*a", "W = F/d", "W = m*v"],
    correct: 0,
    topic: "Work & Energy"
  },
  {
    q: "What is the unit of work and energy?",
    options: ["Newton", "Watt", "Joule", "Pascal"],
    correct: 2,
    topic: "Work & Energy"
  },
  {
    q: "A 2kg object moving at 5 m/s has kinetic energy of:",
    options: ["10 J", "25 J", "50 J", "100 J"],
    correct: 1,
    topic: "Work & Energy"
  },
  {
    q: "Potential energy depends on an object's:",
    options: ["Speed", "Mass and height", "Acceleration", "Temperature"],
    correct: 1,
    topic: "Work & Energy"
  },
  {
    q: "Power is defined as:",
    options: ["Force × distance", "Work / time", "Mass × velocity", "Force / mass"],
    correct: 1,
    topic: "Work & Energy"
  },
  {
    q: "The law of conservation of energy states that:",
    options: ["Energy can be created", "Energy can be destroyed", "Energy cannot be created or destroyed", "Energy always increases"],
    correct: 2,
    topic: "Work & Energy"
  },
  {
    q: "If you lift a 10kg box 2m high, how much work do you do? (g=10m/s²)",
    options: ["20 J", "100 J", "200 J", "400 J"],
    correct: 2,
    topic: "Work & Energy"
  },
  
  // Mixed Review Questions
  {
    q: "Which quantity is a vector?",
    options: ["Speed", "Distance", "Mass", "Velocity"],
    correct: 3,
    topic: "Mixed"
  },
  {
    q: "1 kilometer equals how many meters?",
    options: ["10 m", "100 m", "1000 m", "10000 m"],
    correct: 2,
    topic: "Mixed"
  },
  {
    q: "What does SI stand for in physics?",
    options: ["Scientific International", "Système International", "Standard Integration", "Simple Index"],
    correct: 1,
    topic: "Mixed"
  }
];

const PHYSICS_LESSONS = {
  "Kinematics": [
    "v = d / t (Velocity)",
    "a = (vf - vi) / t (Acceleration)",
    "d = vi*t + 1/2*a*t² (Displacement)"
  ],
  "Dynamics": [
    "F = m * a (Newton's 2nd Law)",
    "w = m * g (Weight)",
    "F_fric = μ * F_norm (Friction)"
  ],
  "Work & Energy": [
    "W = F * d (Work)",
    "KE = 1/2 * m * v² (Kinetic Energy)",
    "PE = m * g * h (Potential Energy)"
  ]
};

const GAME_CONFIG = {
  SCREEN_WIDTH: 800,
  SCREEN_HEIGHT: 600,
  PLAYER_SPEED: 5,
  PLAYER_WIDTH: 60,
  PLAYER_HEIGHT: 100,
  MAX_PLAYERS_PER_ROOM: 20
};

// Export for both Node.js (server) and browser (client)
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    QUIZ_QUESTIONS,
    PHYSICS_LESSONS,
    GAME_CONFIG
  };
} else {
  // Browser environment - make available globally
  window.QUIZ_QUESTIONS = QUIZ_QUESTIONS;
  window.PHYSICS_LESSONS = PHYSICS_LESSONS;
  window.GAME_CONFIG = GAME_CONFIG;
}
