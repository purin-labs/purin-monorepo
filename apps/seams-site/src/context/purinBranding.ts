/* The wordmark is the cat and the word PURIN in one colour. Pantry traces it
   from the owner's image: `docs/brand/purin-logo` in purin-labs/pantry. */
export const PURIN_BRAND_ASSETS = {
  /** The colour mark on a transparent ground. The cat is dark: use it on a light ground. */
  mark: '/brand/purin-mark.svg',
  /** The colour mark with its motion inside the file: it moves as a plain image. */
  markAnimated: '/brand/purin-mark-animated.svg',
  /** The colour mark on its cream tile. */
  icon: '/brand/purin-icon.svg',
  wordmark: '/brand/purin-wordmark.svg',
  /** The width of the wordmark for a height of 1. */
  wordmarkRatio: 1654 / 554,
} as const;
