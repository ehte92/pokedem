import { Variants } from 'framer-motion';

export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
};

export const tabContentVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
};
