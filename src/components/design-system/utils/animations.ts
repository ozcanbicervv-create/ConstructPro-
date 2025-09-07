/**
 * Animation Utilities and Presets
 * 
 * Framer Motion configurations and animation presets for the design system
 */

import { Variants, Transition, MotionProps } from 'framer-motion';

// === EASING FUNCTIONS === //
export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  sharp: [0.4, 0, 0.6, 1],
  spring: [0.175, 0.885, 0.32, 1.275],
  bounce: [0.68, -0.55, 0.265, 1.55],
} as const;

// === DURATION PRESETS === //
export const durations = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
} as const;

// === TRANSITION PRESETS === //
export const transitions: Record<string, Transition> = {
  default: {
    duration: durations.normal,
    ease: easings.easeInOut,
  },
  fast: {
    duration: durations.fast,
    ease: easings.easeOut,
  },
  slow: {
    duration: durations.slow,
    ease: easings.easeInOut,
  },
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
  bouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
  },
  smooth: {
    type: 'tween',
    duration: durations.normal,
    ease: easings.easeInOut,
  },
};

// === ANIMATION VARIANTS === //

/**
 * Fade animations
 */
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

/**
 * Slide animations
 */
export const slideVariants: Variants = {
  hiddenLeft: {
    opacity: 0,
    x: -20,
  },
  hiddenRight: {
    opacity: 0,
    x: 20,
  },
  hiddenUp: {
    opacity: 0,
    y: -20,
  },
  hiddenDown: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

/**
 * Scale animations
 */
export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: transitions.fast,
  },
};

/**
 * Stagger animations for lists
 */
export const staggerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: transitions.fast,
  },
};

/**
 * Modal/Dialog animations
 */
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: transitions.fast,
  },
};

export const overlayVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: transitions.fast,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

/**
 * Drawer/Sidebar animations
 */
export const drawerVariants: Variants = {
  closed: {
    x: '-100%',
    transition: transitions.default,
  },
  open: {
    x: 0,
    transition: transitions.default,
  },
};

/**
 * Collapse/Expand animations
 */
export const collapseVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: transitions.default,
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: transitions.default,
  },
};

/**
 * Hover animations
 */
export const hoverVariants = {
  scale: {
    scale: 1.05,
    transition: transitions.fast,
  },
  lift: {
    y: -2,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    transition: transitions.fast,
  },
  glow: {
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
    transition: transitions.fast,
  },
};

/**
 * Tap animations
 */
export const tapVariants = {
  scale: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
  press: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// === CONSTRUCTION-SPECIFIC ANIMATIONS === //

/**
 * Progress animations for construction projects
 */
export const progressVariants: Variants = {
  initial: {
    width: 0,
  },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 1,
      ease: easings.easeOut,
    },
  }),
};

/**
 * Status change animations
 */
export const statusVariants: Variants = {
  pending: {
    backgroundColor: '#f59e0b',
    scale: 1,
  },
  inProgress: {
    backgroundColor: '#3b82f6',
    scale: 1.05,
    transition: transitions.spring,
  },
  completed: {
    backgroundColor: '#10b981',
    scale: 1,
    transition: transitions.spring,
  },
  delayed: {
    backgroundColor: '#ef4444',
    scale: 1,
    x: [0, -2, 2, -2, 2, 0],
    transition: {
      x: {
        duration: 0.5,
        repeat: 2,
      },
      backgroundColor: transitions.default,
    },
  },
};

/**
 * Material loading animations
 */
export const materialLoadVariants: Variants = {
  loading: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  loaded: {
    opacity: 1,
    transition: transitions.default,
  },
};

// === UTILITY FUNCTIONS === //

/**
 * Creates a stagger animation for child elements
 */
export function createStaggerAnimation(
  staggerDelay: number = 0.1,
  childDelay: number = 0
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: childDelay,
      },
    },
  };
}

/**
 * Creates a custom slide animation
 */
export function createSlideAnimation(
  direction: 'left' | 'right' | 'up' | 'down',
  distance: number = 20
): Variants {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { x: -distance, opacity: 0 };
      case 'right':
        return { x: distance, opacity: 0 };
      case 'up':
        return { y: -distance, opacity: 0 };
      case 'down':
        return { y: distance, opacity: 0 };
    }
  };

  return {
    hidden: getInitialPosition(),
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: transitions.default,
    },
  };
}

/**
 * Creates a custom scale animation
 */
export function createScaleAnimation(
  initialScale: number = 0.9,
  finalScale: number = 1
): Variants {
  return {
    hidden: {
      opacity: 0,
      scale: initialScale,
    },
    visible: {
      opacity: 1,
      scale: finalScale,
      transition: transitions.spring,
    },
  };
}

/**
 * Performance optimization: Reduce motion for users who prefer it
 */
export function getReducedMotionVariants(variants: Variants): Variants {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Return simplified variants without complex animations
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.1 } },
      exit: { opacity: 0, transition: { duration: 0.1 } },
    };
  }
  return variants;
}

/**
 * Common motion props for interactive elements
 */
export const interactiveMotionProps: MotionProps = {
  whileHover: hoverVariants.lift,
  whileTap: tapVariants.scale,
  transition: transitions.fast,
};

/**
 * Common motion props for cards
 */
export const cardMotionProps: MotionProps = {
  initial: 'hidden',
  animate: 'visible',
  exit: 'exit',
  variants: getReducedMotionVariants(scaleVariants),
  whileHover: hoverVariants.lift,
  transition: transitions.default,
};

/**
 * Common motion props for buttons
 */
export const buttonMotionProps: MotionProps = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: transitions.fast,
};

/**
 * Common motion props for modals
 */
export const modalMotionProps: MotionProps = {
  initial: 'hidden',
  animate: 'visible',
  exit: 'exit',
  variants: getReducedMotionVariants(modalVariants),
};