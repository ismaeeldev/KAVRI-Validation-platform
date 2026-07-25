/**
 * Reusable animation presets for motion/react.
 * Returns variants that automatically adjust if prefers-reduced-motion is active.
 */

export const getFadeRisePresets = (shouldReduceMotion: boolean) => ({
  hidden: {
    opacity: 0,
    y: shouldReduceMotion ? 0 : 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: shouldReduceMotion ? 0.05 : 0.4,
      ease: "easeOut",
    },
  },
});

export const getStaggerContainerPresets = (shouldReduceMotion: boolean) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: shouldReduceMotion ? 0 : 0.08,
      delayChildren: shouldReduceMotion ? 0 : 0.05,
    },
  },
});

export const getSignalWipePresets = (shouldReduceMotion: boolean) => ({
  hidden: {
    clipPath: shouldReduceMotion ? "inset(0% 0% 0% 0%)" : "inset(0% 100% 0% 0%)",
  },
  visible: {
    clipPath: "inset(0% 0% 0% 0%)",
    transition: {
      duration: shouldReduceMotion ? 0.05 : 0.6,
      ease: [0.25, 1, 0.5, 1], // easeOutQuart
    },
  },
});

export const getProgressFillPresets = (shouldReduceMotion: boolean, targetPercent: number) => ({
  hidden: { width: "0%" },
  visible: {
    width: `${targetPercent}%`,
    transition: {
      duration: shouldReduceMotion ? 0.05 : 0.8,
      ease: "easeOut",
    },
  },
});

export const getSubtleLayoutPresets = () => ({
  layout: true,
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 38,
  },
});
