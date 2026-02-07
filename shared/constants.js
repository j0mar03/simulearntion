// Shared Constants between Client and Server

const QUIZ_QUESTIONS = [
  // Electromagnetism
  {
    q: "If you try to force two \"push\" sides of a magnet together, what will they do?",
    options: [
      "A) Stick together like a hug",
      "B) Turn into a giant sparkle",
      "C) Wiggle and shove each other away",
      "D) Turn into a straight line"
    ],
    correct: 2,
    topic: "Electromagnetism"
  },
  {
    q: "What causes the \"sparkly high-five\" we call lightning?",
    options: [
      "A) Magnets in the sky",
      "B) Fluffy cloud friends rubbing together and getting tickly with static",
      "C) Light dancing in a straight line",
      "D) Tiny electrons playing hide-and-seek"
    ],
    correct: 1,
    topic: "Electromagnetism"
  },
  {
    q: "Why can’t you see around corners?",
    options: [
      "A) Light is too shy to turn",
      "B) Light is a slow dancer",
      "C) Gravity pulls light down for a hug",
      "D) The corners are too tickly"
    ],
    correct: 0,
    topic: "Electromagnetism"
  },
  {
    q: "Every magnet, even a tiny one on your fridge, has two ends. What are they?",
    options: [
      "A) A fast side and a slow side",
      "B) A \"hug\" side and a \"push\" side",
      "C) A straight side and a wiggly side",
      "D) A sparkly side and a dull side"
    ],
    correct: 1,
    topic: "Electromagnetism"
  },
  {
    q: "What is the fastest thing in the whole universe?",
    options: [
      "A) A scooter with a magic meter",
      "B) A falling rock",
      "C) Light",
      "D) A paper airplane"
    ],
    correct: 2,
    topic: "Electromagnetism"
  },

  // Projectile Motion
  {
    q: "When you throw a toy, why does it make a \"rainbow shape\" in the air?",
    options: [
      "A) It wants to find a pot of gold",
      "B) It is trying to fly like a bird",
      "C) Gravity is pulling it down for a hug",
      "D) It is avoiding the air"
    ],
    correct: 2,
    topic: "Projectile Motion"
  },
  {
    q: "If you drop a heavy rock and a crumbled paper ball from the same high place, what happens?",
    options: [
      "A) The rock hits first because it is heavy",
      "B) They hit the ground at the same time",
      "C) The paper ball hits first because it is light",
      "D) The paper ball floats away forever"
    ],
    correct: 1,
    topic: "Projectile Motion"
  },
  {
    q: "To throw something the farthest, how should you aim?",
    options: [
      "A) Straight out",
      "B) Straight up to the sky",
      "C) Like you’re blowing a flying kiss up at a gentle angle",
      "D) Straight down at the ground"
    ],
    correct: 2,
    topic: "Projectile Motion"
  },
  {
    q: "Why does a flat paper airplane fall differently than a crumbled paper ball?",
    options: [
      "A) The air likes to push on the flat paper to give it a ride",
      "B) The rock is more magic",
      "C) Gravity hates flat paper",
      "D) The air is too tickly for the paper"
    ],
    correct: 0,
    topic: "Projectile Motion"
  },
  {
    q: "No matter how hard you throw a ball sideways, what is gravity doing?",
    options: [
      "A) Pushing it further sideways",
      "B) Helping it stay in a straight line",
      "C) Pulling it straight down",
      "D) Making it spin like an electron"
    ],
    correct: 2,
    topic: "Projectile Motion"
  },

  // Distance vs. Displacement
  {
    q: "If you push a toy car all over the room, what is the \"distance\"?",
    options: [
      "A) How far the car is from the start in a straight line",
      "B) How many inches the wheels rolled on the crazy path",
      "C) The \"X marks the spot\" line",
      "D) Zero"
    ],
    correct: 1,
    topic: "Distance vs. Displacement"
  },
  {
    q: "If you run in a giant circle and end up right where you started, what is your displacement?",
    options: [
      "A) A very big number",
      "B) The same as the distance",
      "C) Zero",
      "D) The length of the circle"
    ],
    correct: 2,
    topic: "Distance vs. Displacement"
  },
  {
    q: "On a treasure map, what represents the \"displacement\"?",
    options: [
      "A) The dotted path around mountains and rivers",
      "B) The total number of steps you took",
      "C) The straight \"X marks the spot\" line from \"You Are Here\"",
      "D) The depth of the hole you dug"
    ],
    correct: 2,
    topic: "Distance vs. Displacement"
  },
  {
    q: "Displacement is like how a ________ would fly.",
    options: [
      "A) Snail",
      "B) Bird",
      "C) Toy car",
      "D) Paper airplane"
    ],
    correct: 1,
    topic: "Distance vs. Displacement"
  },
  {
    q: "You walk a long way around the playground but finish at the start. Which of these is true?",
    options: [
      "A) Your distance is zero",
      "B) Your displacement is zero",
      "C) Both distance and displacement are zero",
      "D) You didn't move at all"
    ],
    correct: 1,
    topic: "Distance vs. Displacement"
  },

  // Speed vs. Acceleration
  {
    q: "What is acceleration?",
    options: [
      "A) The number on your scooter's magic meter",
      "B) That \"funny tummy\" feeling when your speed changes",
      "C) Zooming at a steady number 5",
      "D) Walking in a straight line"
    ],
    correct: 1,
    topic: "Speed vs. Acceleration"
  },
  {
    q: "When you are at the bottom of a swing whooshing past your parents at your fastest, what is your acceleration?",
    options: [
      "A) Super high",
      "B) Zero",
      "C) Backwards",
      "D) Sparkly"
    ],
    correct: 1,
    topic: "Speed vs. Acceleration"
  },
  {
    q: "What happens to your acceleration when you use the brakes on your bike?",
    options: [
      "A) It stops completely",
      "B) It becomes \"backwards\" acceleration because your speed is changing",
      "C) It turns into displacement",
      "D) It stays at zero"
    ],
    correct: 1,
    topic: "Speed vs. Acceleration"
  },
  {
    q: "Speed is like the ________ on your scooter's meter.",
    options: [
      "A) Color",
      "B) Shape",
      "C) Number",
      "D) Weight"
    ],
    correct: 2,
    topic: "Speed vs. Acceleration"
  },
  {
    q: "Acceleration isn't just for speeding up; it's for:",
    options: [
      "A) Any change in your zoom",
      "B) Only going in circles",
      "C) Staying at the same speed",
      "D) Finding treasure"
    ],
    correct: 0,
    topic: "Speed vs. Acceleration"
  },

  // Quantum Mechanics
  {
    q: "What is it called when a particle magically appears on the other side of a \"wall\"?",
    options: [
      "A) Entanglement",
      "B) High-fiving",
      "C) Quantum tunneling",
      "D) The flying kiss"
    ],
    correct: 2,
    topic: "Quantum Mechanics"
  },
  {
    q: "If two electrons are \"entangled\" best friends and one spins left, what does the other do?",
    options: [
      "A) Spins left too",
      "B) Instantly spins to the right",
      "C) Stops spinning",
      "D) High-fives the ground"
    ],
    correct: 1,
    topic: "Quantum Mechanics"
  },
  {
    q: "In the tiny world of particles, how many places can a toy car be at once?",
    options: [
      "A) Only one",
      "B) Two places at once",
      "C) Zero",
      "D) It disappears forever"
    ],
    correct: 1,
    topic: "Quantum Mechanics"
  },
  {
    q: "When do you find out which room a tiny electron is actually in?",
    options: [
      "A) When it spins",
      "B) When you go look for it",
      "C) When it hits a wall",
      "D) When it turns into a magnet"
    ],
    correct: 1,
    topic: "Quantum Mechanics"
  },
  {
    q: "How fast do \"entangled\" best friends talk to each other?",
    options: [
      "A) Faster than anything",
      "B) At the speed of a scooter",
      "C) Like a bird flying",
      "D) As slow as a rock"
    ],
    correct: 0,
    topic: "Quantum Mechanics"
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

const DEFAULT_PLAYER_TITLE = 'Rookie';

const ACHIEVEMENTS = {
  // Topic Mastery
  'kinematics_master': { name: 'Kinematics Master', icon: '🎯', desc: 'Study Kinematics', title: 'Kinematics Master' },
  'dynamics_master': { name: 'Dynamics Master', icon: '⚡', desc: 'Study Dynamics', title: 'Dynamics Master' },
  'energy_master': { name: 'Energy Master', icon: '💫', desc: 'Study Work & Energy', title: 'Energy Sage' },
  
  // Quiz Performance
  'first_quiz': { name: 'Quiz Rookie', icon: '📝', desc: 'Complete first quiz', title: 'Quiz Rookie' },
  'quiz_ace': { name: 'Quiz Ace', icon: '🌟', desc: 'Score 80%+ on quiz', title: 'Quiz Ace' },
  'perfect_score': { name: 'Perfect Score', icon: '👑', desc: 'Score 100% on quiz', title: 'Crowned Scholar' },
  'quiz_master': { name: 'Quiz Master', icon: '🏆', desc: 'Complete 10 quizzes', title: 'Quiz Master' },
  
  // Streaks
  'streak_3': { name: '3-Day Streak', icon: '🔥', desc: '3 days in a row', title: 'Streak Starter' },
  'streak_7': { name: '1-Week Streak', icon: '🔥🔥', desc: '7 days in a row', title: 'Week Warrior' },
  'streak_30': { name: '1-Month Streak', icon: '🔥🔥🔥', desc: '30 days in a row', title: 'Consistency Legend' },
  
  // Engagement
  'customizer': { name: 'Customizer', icon: '🎨', desc: 'Customize avatar', title: 'Style Crafter' },
  'explorer': { name: 'Explorer', icon: '🗺️', desc: 'Visit all areas', title: 'World Explorer' },
  'dedicated_learner': { name: 'Dedicated Learner', icon: '📚', desc: '1 hour playtime', title: 'Dedicated Learner' }
};

// Export for both Node.js (server) and browser (client)
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    QUIZ_QUESTIONS,
    PHYSICS_LESSONS,
    GAME_CONFIG,
    DEFAULT_PLAYER_TITLE,
    ACHIEVEMENTS
  };
} else {
  // Browser environment - make available globally
  window.QUIZ_QUESTIONS = QUIZ_QUESTIONS;
  window.PHYSICS_LESSONS = PHYSICS_LESSONS;
  window.GAME_CONFIG = GAME_CONFIG;
  window.DEFAULT_PLAYER_TITLE = DEFAULT_PLAYER_TITLE;
  window.ACHIEVEMENTS = ACHIEVEMENTS;
}
