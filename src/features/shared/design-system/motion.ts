import type { Transition } from "motion/react";
import { designTokens } from "./tokens";

const { duration, easing } = designTokens.motion;

export const motionPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 4 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },
  slideRight: {
    initial: { opacity: 0, x: -12 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -8 },
  },
} as const;

export const transitions = {
  soft: {
    duration: duration.normal / 1000,
    ease: easing.soft.split("cubic-bezier(")[1]?.replace(")", "").split(", ").map(Number) as [
      number,
      number,
      number,
      number,
    ],
  } satisfies Transition,
  snappy: {
    duration: duration.fast / 1000,
    ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
  } satisfies Transition,
  emphasize: {
    duration: duration.slow / 1000,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  } satisfies Transition,
} as const;

/** CSS transition utility strings for non-Motion elements */
export const cssTransition = {
  colors: `color ${duration.fast}ms ${easing.soft}, background-color ${duration.fast}ms ${easing.soft}, border-color ${duration.fast}ms ${easing.soft}`,
  transform: `transform ${duration.normal}ms ${easing.soft}, opacity ${duration.fast}ms ${easing.soft}`,
  all: `all ${duration.normal}ms ${easing.soft}`,
} as const;
