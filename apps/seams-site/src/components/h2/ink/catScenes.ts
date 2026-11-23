import type { InkPoint } from './brush';
import { blob, goatScene, wheat, type InkMotion, type InkPart, type InkScene } from './scenes';

/* The Purin cat in ink: it sits behind the goat and looks up at the kite. The goat
   leads; the cat follows and waits. Its tall pointed ears and its round eye with
   no pupil come from the Purin mark. */

type Pt = readonly [number, number];

/* the cat sits with its seat at x, y and looks up to the right */
const SEAT: Pt = [66, 489];
const K = 1;

function at(px: number, py: number): [number, number] {
  return [SEAT[0] + px * K, SEAT[1] + py * K];
}

function pts(list: readonly InkPoint[]): InkPoint[] {
  return list.map(([px, py, w]): InkPoint => [...at(px, py), w * K]);
}

const NECK = at(9, -50);
const TAIL_JOINT = at(-44, -7);
const EAR_BACK = at(10, -72);

/* the kite sways about the goat's mouth; the head turns with it, so the cat watches it */
const WATCH: InkMotion = { kind: 'sway', amount: '1.4deg', seconds: 4.3, origin: NECK };

export function inkCat(): InkPart[] {
  return [
    {
      id: 'cat-tail',
      strokes: [
        /* the tail lies on the ground behind the cat */
        {
          pts: pts([
            [-14, -6, 10],
            [-28, -3, 8],
            [-42, -5, 6.5],
            [-46, -8, 5],
          ]),
          dry: 0.08,
          rough: 0.8,
          grain: 0.02,
        },
      ],
    },
    {
      id: 'cat-tail-tip',
      /* the tip lifts and falls while the cat watches */
      motions: [
        { kind: 'sway', amount: '9deg', seconds: 1.9, origin: TAIL_JOINT },
        { kind: 'sway', amount: '3deg', seconds: 3.3, delay: -1.1, origin: TAIL_JOINT },
      ],
      strokes: [
        {
          pts: pts([
            [-44, -6, 6],
            [-51, -13, 5],
            [-52, -22, 3.4],
            [-48, -29, 1.4],
          ]),
          dry: 0.18,
          rough: 0.9,
          grain: 0.01,
        },
      ],
    },
    {
      id: 'cat-body',
      strokes: [
        /* one fat pear, painted downward: the neck at the front, the haunch at the back */
        {
          pts: pts([
            [11, -54, 20],
            [5, -42, 27],
            [-1, -28, 34],
            [-6, -14, 38],
            [-6, -3, 31],
          ]),
          dry: 0.03,
          rough: 0.6,
          grain: 0.03,
          pace: 0.7,
        },
        /* a round haunch */
        blob(...at(-11, -15), 18 * K, 15 * K),
        /* the front legs, straight down to the paws */
        {
          pts: pts([
            [12, -36, 11],
            [14, -18, 8],
            [16, -1, 7.5],
          ]),
          grain: 0.03,
          rough: 0.5,
        },
        /* a light line between the leg and the haunch, so the leg reads */
        {
          color: 'clear',
          pts: pts([
            [7, -26, 1],
            [7, -15, 2.4],
            [8, -5, 1],
          ]),
          dry: 0.3,
          rough: 1,
          grain: 0,
        },
      ],
    },
    {
      id: 'cat-head',
      motions: [WATCH],
      strokes: [
        /* the far ear, tall and pointed as on the mark */
        {
          pts: pts([
            [5, -69, 10],
            [1, -77, 6.5],
            [-3, -85, 1.4],
          ]),
          grain: 0.01,
          rough: 0.3,
        },
        /* a round head, tipped back to look up */
        blob(...at(16, -62), 14.5 * K, 13.5 * K),
        /* a short muzzle that points at the kite */
        {
          pts: pts([
            [18, -62, 17],
            [24, -69, 11],
            [28, -74, 5],
          ]),
          grain: 0.01,
          rough: 0.3,
        },
        /* the round eye of the mark, with no pupil */
        blob(...at(20, -67), 3.5 * K, 3.9 * K, 'clear'),
      ],
    },
    {
      id: 'cat-ear',
      /* the near ear listens */
      motions: [WATCH, { kind: 'sway', amount: '5deg', seconds: 2.7, delay: -0.6, origin: EAR_BACK }],
      strokes: [
        {
          pts: pts([
            [13, -73, 10],
            [10, -81, 6.5],
            [6, -89, 1.4],
          ]),
          grain: 0.01,
          rough: 0.3,
        },
      ],
    },
  ];
}

/* The stalk behind the cat stands a little further left than in the goat scene,
   so its ear does not hide the cat's ears. */
const BEHIND_CAT = wheat('behind-b', [34, 545], [12, 480], [44, 400], 5021, 0.86);

/* the hero goat with the cat behind it, among the back wheat and before the goat */
export const goatCatScene: InkScene = {
  ...goatScene,
  parts: goatScene.parts.flatMap((part): InkPart[] => {
    if (part.id === 'behind-b-stem') return BEHIND_CAT;
    if (part.id === 'behind-b-ear') return [];
    if (part.id === 'kid-far-legs') return [...inkCat(), part];
    return [part];
  }),
};
