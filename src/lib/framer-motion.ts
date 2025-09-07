/**
 * Framer Motion Configuration
 * 
 * Global configuration and performance optimizations for Framer Motion
 */

import { MotionConfig, MotionConfigProps } from 'framer-motion';
import React, { ReactNode } from 'react';

// === GLOBAL MOTION CONFIGURATION === //

/**
 * Global motion configuration with performance optimizations
 */
export const globalMotionConfig: MotionConfigProps = {
  // Reduce motion for users who prefer it
  reducedMotion: 'user',
  
  // Global transition defaults
  transition: {
    type: 'tween',
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1], // easeInOut
  },
  
  // Performance optimizations
  features: {
    // Enable layout animations
    layout: true,
    // Enable animation controls
    animation: true,
    // Enable exit animations
    exit: true,
    // Enable gesture recognition
    gestures: true,
  },
};

/**
 * Motion Config Provider Component
 * 
 * Wraps the app with global motion configuration
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return React.createElement(
    MotionConfig,
    globalMotionConfig,
    children
  );
}

// === PERFORMANCE OPTIMIZATIONS === //

/**
 * Performance optimization settings
 */
export const performanceConfig = {
  // Disable animations on low-end devices
  disableAnimationsOnLowEndDevices: true,
  
  // Reduce motion complexity on mobile
  reducedMotionOnMobile: true,
  
  // Use transform instead of layout animations when possible
  preferTransform: true,
  
  // Enable hardware acceleration
  enableHardwareAcceleration: true,
  
  // Optimize for 60fps
  targetFPS: 60,
};

/**
 * Checks if device is low-end based on various factors
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') {return false;}
  
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }
  
  // Check device memory (if available)
  const navigator = window.navigator as any;
  if (navigator.deviceMemory && navigator.deviceMemory < 4) {
    return true;
  }
  
  // Check hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return true;
  }
  
  // Check connection speed
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
    return true;
  }
  
  return false;
}

/**
 * Gets optimized motion settings based on device capabilities
 */
export function getOptimizedMotionSettings() {
  const isLowEnd = isLowEndDevice();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  return {
    // Reduce animation duration on low-end devices
    duration: isLowEnd ? 0.15 : 0.3,
    
    // Simplify easing on low-end devices
    ease: isLowEnd ? 'linear' : [0.4, 0, 0.2, 1],
    
    // Disable complex animations on low-end devices
    enableComplexAnimations: !isLowEnd,
    
    // Reduce stagger delay on mobile
    staggerDelay: isMobile ? 0.05 : 0.1,
    
    // Use simpler variants on low-end devices
    useSimpleVariants: isLowEnd,
  };
}

// === ANIMATION PRESETS === //

/**
 * Optimized animation presets based on device capabilities
 */
export function getAnimationPresets() {
  const settings = getOptimizedMotionSettings();
  
  return {
    // Fade animations
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: {
        duration: settings.duration,
        ease: settings.ease,
      },
    },
    
    // Slide animations
    slideUp: {
      initial: { opacity: 0, y: settings.enableComplexAnimations ? 20 : 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: settings.enableComplexAnimations ? -20 : -10 },
      transition: {
        duration: settings.duration,
        ease: settings.ease,
      },
    },
    
    // Scale animations
    scale: settings.enableComplexAnimations ? {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
      transition: {
        duration: settings.duration,
        ease: settings.ease,
      },
    } : {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: {
        duration: settings.duration,
        ease: settings.ease,
      },
    },
    
    // Stagger animations
    stagger: {
      animate: {
        transition: {
          staggerChildren: settings.staggerDelay,
          delayChildren: 0.1,
        },
      },
    },
  };
}

// === GESTURE CONFIGURATIONS === //

/**
 * Optimized gesture configurations
 */
export const gestureConfig = {
  // Drag configuration
  drag: {
    dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
    dragElastic: 0.1,
    dragMomentum: false, // Disable momentum on low-end devices
  },
  
  // Hover configuration
  hover: {
    scale: 1.02,
    transition: { duration: 0.15 },
  },
  
  // Tap configuration
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
  
  // Pan configuration
  pan: {
    threshold: 10,
    velocity: 0.5,
  },
};

// === LAYOUT ANIMATION OPTIMIZATIONS === //

/**
 * Layout animation configuration with performance optimizations
 */
export const layoutConfig = {
  // Use layout animations only when necessary
  layout: true,
  
  // Optimize layout animations
  layoutId: undefined, // Set per component
  
  // Layout transition configuration
  layoutTransition: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  },
  
  // Shared layout configuration
  sharedLayout: {
    // Enable shared layout animations
    enabled: true,
    
    // Optimize for performance
    type: 'crossfade',
  },
};

// === SCROLL ANIMATIONS === //

/**
 * Scroll-triggered animation configuration
 */
export const scrollConfig = {
  // Viewport configuration
  viewport: {
    once: true, // Animate only once for performance
    margin: '0px 0px -100px 0px', // Trigger before element is visible
    amount: 0.3, // Trigger when 30% of element is visible
  },
  
  // Scroll variants
  scrollVariants: {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
};

// === UTILITY FUNCTIONS === //

/**
 * Creates optimized motion props for components
 */
export function createMotionProps(
  type: 'fade' | 'slideUp' | 'scale' | 'custom',
  customProps?: any
) {
  const presets = getAnimationPresets();
  const baseProps = presets[type as keyof typeof presets] || presets.fade;
  
  return {
    ...baseProps,
    ...customProps,
  };
}

/**
 * Creates optimized stagger container props
 */
export function createStaggerContainer(
  staggerDelay?: number,
  delayChildren?: number
) {
  const settings = getOptimizedMotionSettings();
  
  return {
    initial: 'hidden',
    animate: 'visible',
    variants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay || settings.staggerDelay,
          delayChildren: delayChildren || 0.1,
        },
      },
    },
  };
}

/**
 * Creates optimized stagger item props
 */
export function createStaggerItem() {
  const settings = getOptimizedMotionSettings();
  
  return {
    variants: {
      hidden: {
        opacity: 0,
        y: settings.enableComplexAnimations ? 20 : 0,
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: settings.duration,
          ease: settings.ease,
        },
      },
    },
  };
}

/**
 * Creates optimized hover props
 */
export function createHoverProps(
  scale = 1.02,
  duration = 0.15
) {
  const settings = getOptimizedMotionSettings();
  
  if (!settings.enableComplexAnimations) {
    return {}; // Disable hover animations on low-end devices
  }
  
  return {
    whileHover: { scale },
    transition: { duration },
  };
}

/**
 * Creates optimized tap props
 */
export function createTapProps(
  scale = 0.98,
  duration = 0.1
) {
  return {
    whileTap: { scale },
    transition: { duration },
  };
}

// === CONSTRUCTION-SPECIFIC ANIMATIONS === //

/**
 * Construction industry specific animation presets
 */
export const constructionAnimations = {
  // Project card animations
  projectCard: {
    ...createMotionProps('scale'),
    ...createHoverProps(1.03, 0.2),
    ...createTapProps(0.97),
  },
  
  // Task item animations
  taskItem: {
    ...createMotionProps('slideUp'),
    ...createHoverProps(1.01, 0.15),
  },
  
  // Material card animations
  materialCard: {
    ...createMotionProps('fade'),
    ...createHoverProps(1.02, 0.2),
  },
  
  // Dashboard widget animations
  dashboardWidget: {
    ...createMotionProps('scale'),
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      delay: 0.1,
    },
  },
  
  // Progress bar animations
  progressBar: {
    initial: { width: 0 },
    animate: { width: '100%' },
    transition: {
      duration: 1,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  
  // Status change animations
  statusChange: {
    initial: { scale: 1 },
    animate: { scale: [1, 1.1, 1] },
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * Gets construction-specific animation props
 */
export function getConstructionAnimation(
  type: keyof typeof constructionAnimations
) {
  return constructionAnimations[type];
}