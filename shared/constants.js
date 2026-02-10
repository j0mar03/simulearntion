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
    q: "What is the primary goal of Quantum Gravity theory?",
    options: [
      "A) To replace Quantum Mechanics with a more complete theory.",
      "B) To unify the theories of General Relativity and Quantum Mechanics.",
      "C) To prove that gravity is the strongest fundamental force.",
      "D) To modify Einstein's theory of Special Relativity."
    ],
    correct: 1,
    topic: "Quantum Mechanics"
  },
  {
    q: "According to the text, who is credited as the founder of quantum mechanics and formulated a relativistic quantum theory?",
    options: [
      "A) Albert Einstein",
      "B) Niels Bohr",
      "C) Paul Dirac",
      "D) Isaac Newton"
    ],
    correct: 2,
    topic: "Quantum Mechanics"
  },
  {
    q: "What does the \"quantum\" in Quantum Mechanics fundamentally refer to?",
    options: [
      "A) The speed of light.",
      "B) The curvature of spacetime.",
      "C) The smallest discrete unit of an entity.",
      "D) The study of mechanical engines."
    ],
    correct: 2,
    topic: "Quantum Mechanics"
  },
  {
    q: "How does General Relativity describe gravity?",
    options: [
      "A) As a force transmitted by particles called gravitons.",
      "B) As the curvature of spacetime caused by mass and energy.",
      "C) As a consequence of the uncertainty principle.",
      "D) As an electromagnetic interaction between masses."
    ],
    correct: 1,
    topic: "Quantum Mechanics"
  },
  {
    q: "Which principle in Quantum Mechanics states that the probability of finding a particle in a certain position is uncertain?",
    options: [
      "A) The Exclusion Principle",
      "B) The Correspondence Principle",
      "C) The Equivalence Principle",
      "D) The Uncertainty Principle"
    ],
    correct: 3,
    topic: "Quantum Mechanics"
  },
  {
    q: "What is a key reason why Quantum Gravity remains a theoretical framework?",
    options: [
      "A) It is not yet proven by experiment or observation.",
      "B) It contradicts both General Relativity and Quantum Mechanics.",
      "C) It has been mathematically proven impossible.",
      "D) Albert Einstein rejected its core ideas."
    ],
    correct: 0,
    topic: "Quantum Mechanics"
  },
  {
    q: "According to the \"Fun Fact,\" how does the strength of gravity compare to other fundamental forces like electromagnetism?",
    options: [
      "A) Gravity is much stronger.",
      "B) They are roughly equal in strength.",
      "C) Gravity is much weaker.",
      "D) Their strength cannot be compared."
    ],
    correct: 2,
    topic: "Quantum Mechanics"
  },
  {
    q: "Which physicist, described as the \"Father of Modern Physics,\" developed the theory of General Relativity?",
    options: [
      "A) Paul Dirac",
      "B) Max Planck",
      "C) Albert Einstein",
      "D) Werner Heisenberg"
    ],
    correct: 2,
    topic: "Quantum Mechanics"
  },
  {
    q: "In which of the following environments would the laws of Quantum Gravity be most necessary to understand physics?",
    options: [
      "A) The orbit of planets around a star.",
      "B) The behavior of light passing through a glass prism.",
      "C) The singularity at the center of a black hole.",
      "D) The chemical reactions within a biological cell."
    ],
    correct: 2,
    topic: "Quantum Mechanics"
  },
  {
    q: "While several theories attempt to bridge the gap, which well-known (though unproven) framework suggests that fundamental particles are actually tiny, vibrating one-dimensional lines?",
    options: [
      "A) Kinetic Molecular Theory",
      "B) String Theory",
      "C) Big Bang Theory",
      "D) Atomic Theory"
    ],
    correct: 1,
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

const DEFAULT_PLAYER_TITLE = 'The Trailblazer';

const ACHIEVEMENTS = {
  'freshman': {
    name: 'Freshman',
    icon: 'ach-freshman',
    desc: 'Reach Erudition Level 5',
    title: 'Freshman',
    unlocks: 'u2'
  },
  'engaged_rookie': {
    name: 'Engaged Rookie',
    icon: 'ach-engaged-rookie',
    desc: 'Reach Erudition Level 10',
    title: 'Engaged Rookie',
    unlocks: 'cape'
  },
  'seasoned_learner': {
    name: 'Seasoned Learner',
    icon: 'ach-seasoned-learner',
    desc: 'Reach Erudition Level 15',
    title: 'Seasoned Learner',
    unlocks: 'scarf'
  },
  'physicist': {
    name: 'Physicist',
    icon: 'ach-physicist',
    desc: 'Score 90%+ on a Physics quiz',
    title: 'Physicist',
    unlocks: 'halo'
  },
  'an_enthusiast': {
    name: 'An Enthusiast!',
    icon: 'ach-an-enthusiast',
    desc: 'Play for at least 3 days',
    title: 'An Enthusiast!',
    unlocks: 'sun'
  },
  'trailblazer': {
    name: 'The Trailblazer',
    icon: 'ach-trailblazer',
    desc: 'Achievement gained for participating in prototype testing!',
    title: 'The Trailblazer'
  }
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
