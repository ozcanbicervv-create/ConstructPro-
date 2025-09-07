/**
 * Animation utilities and presets for micro-interactions
 */

import { Variants } from 'framer-motion';

// Easing curves for smooth animations
export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  bouncy: { type: 'spring', stiffness: 400, damping: 10 },
} as const;

// Page transition variants
export const pageTransitions: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: easings.easeIn,
    },
  },
};

// Stagger animation for lists
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.easeOut,
    },
  },
};

// Hover and tap animations
export const hoverScale: Variants = {
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: easings.easeOut,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: easings.easeOut,
    },
  },
};

export const hoverLift: Variants = {
  hover: {
    y: -2,
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
    transition: {
      duration: 0.2,
      ease: easings.easeOut,
    },
  },
  tap: {
    y: 0,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: {
      duration: 0.1,
      ease: easings.easeOut,
    },
  },
};

// Loading animations
export const loadingSpinner: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const loadingPulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: easings.easeInOut,
    },
  },
};

// Success and error animations
export const successBounce: Variants = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 15,
    },
  },
};

export const errorShake: Variants = {
  animate: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
      ease: easings.easeOut,
    },
  },
};

// Slide animations
export const slideInFromRight: Variants = {
  initial: {
    x: '100%',
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easings.easeOut,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: easings.easeIn,
    },
  },
};

export const slideInFromLeft: Variants = {
  initial: {
    x: '-100%',
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easings.easeOut,
    },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: easings.easeIn,
    },
  },
};

// Fade animations
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.easeOut,
    },
  },
};

export const fadeInScale: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: easings.easeOut,
    },
  },
};

// Micro-interaction presets
export const microInteractions = {
  button: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.1 },
  },
  card: {
    whileHover: { 
      y: -2,
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
    },
    transition: { duration: 0.2 },
  },
  icon: {
    whileHover: { rotate: 5, scale: 1.1 },
    whileTap: { rotate: -5, scale: 0.9 },
    transition: { duration: 0.2 },
  },
  input: {
    whileFocus: { 
      scale: 1.01,
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
    transition: { duration: 0.2 },
  },
} as const;