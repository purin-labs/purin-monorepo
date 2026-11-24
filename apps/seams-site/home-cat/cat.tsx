import React, { useContext, useId } from 'react';
import { P } from './paths';
import { R } from './ram-paths';
import { RAM_EAT, RAM_HUG } from './ram-poses';

/* The Purin mark as parts that move: the cat, its ears, its face, its eyes and the pudding.
   Every shape is a traced curve of the logo. A concept ram can take the place of the cat:
   it has the same parts and the same motion classes. */

type Pt = readonly [number, number];

export type Animal = 'cat' | 'ram';

/** Which animal the marks of the page draw. */
export const AnimalContext = React.createContext<Animal>('cat');

/** How the ram's lines are drawn: solid, or painted with the brush of the front page drawings. */
export type Lines = 'solid' | 'brushed';

export const LinesContext = React.createContext<Lines>('solid');

export const MARK_BOX = '67 97 860 860';

/* a view box of the cat, as the same frame round the ram */
function frame(animal: Animal, viewBox: string): string {
  if (animal === 'cat') return viewBox;
  return (R.boxes as Record<string, string>)[viewBox] ?? R.boxes[MARK_BOX];
}

/* a group that turns about a point, in the units of the mark */
function About({ p, c, children }: { p: Pt; c: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <g transform={`translate(${p[0]} ${p[1]})`}>
      <g className={c}>
        <g transform={`translate(${-p[0]} ${-p[1]})`}>{children}</g>
      </g>
    </g>
  );
}

/* The ears, measured on the cat outline. An ear is the part of the cat over the
   line `cut`, at one side of `x`: the point where the ear meets the top of the head.
   An ear leans about the line `base`, a little under the cut, so no gap opens. */
const EARS = { cut: 280, base: 284, left: 409, right: 585 } as const;
const FAR = 2000;

/** The clip shapes that divide the cat into its body and its two ears. */
function EarClips({ id }: { id: string }): React.JSX.Element {
  const { cut, base, left, right } = EARS;
  return (
    <>
      <clipPath id={`${id}-body`}>
        <path
          clipRule="evenodd"
          d={`M${-FAR} ${-FAR}H${FAR}V${FAR}H${-FAR}ZM${-FAR} ${-FAR}H${left}V${cut}H${-FAR}ZM${right} ${-FAR}H${FAR}V${cut}H${right}Z`}
        />
      </clipPath>
      <clipPath id={`${id}-ear-l`}>
        <rect x={-FAR} y={-FAR} width={FAR + left} height={FAR + base} />
      </clipPath>
      <clipPath id={`${id}-ear-r`}>
        <rect x={right} y={-FAR} width={FAR - right} height={FAR + base} />
      </clipPath>
    </>
  );
}

function CatBody({ id }: { id: string }): React.JSX.Element {
  return (
    <About p={P.catPivot} c="pc-sway">
      <About p={P.catPivot} c="pc-lean">
        <g fill="var(--pc-cat)">
          <path d={P.cat} clipPath={`url(#${id}-body)`} />
          <About p={[EARS.left, EARS.base]} c="pc-ear pc-ear--l">
            <path d={P.cat} clipPath={`url(#${id}-ear-l)`} />
          </About>
          <About p={[EARS.right, EARS.base]} c="pc-ear pc-ear--r">
            <path d={P.cat} clipPath={`url(#${id}-ear-r)`} />
          </About>
        </g>
        <g className="pc-face" fill="var(--pc-cream)">
          <path className="pc-eye" d={P.face[0]} />
          <path className="pc-eye" d={P.face[1]} />
          <path className="pc-nose" d={P.face[2]} />
        </g>
      </About>
    </About>
  );
}

/* ---------- the ram ----------
   The ram is drawn with lines, so each part is a fill and the lines that the part owns.
   Its head turns about the neck, its ears turn about their roots, its closed eyes squeeze.
   Its paws hold the pudding, so the ram and the pudding move as one. */

type RamPart = keyof typeof R.fills;

/* one set of the ram's lines: the lines of each part, the eyes, the mouth and the horn ridges */
type LineSet = {
  readonly lines: Readonly<Partial<Record<string, string>>>;
  readonly eyes: readonly string[];
  readonly mouth: string;
  readonly ridges: { readonly hornL: string; readonly hornR: string };
};

/* the solid lines, or the same lines painted with the brush */
function useLineSet(solid: LineSet, brushed: LineSet): LineSet {
  return useContext(LinesContext) === 'brushed' ? brushed : solid;
}

/* one part: its fill, then the lines that it owns */
function Piece({ d, line, fill }: { d: string; line?: string; fill: string }): React.JSX.Element {
  return (
    <>
      <path d={d} fill={fill} fillRule="evenodd" />
      {line ? <path d={line} fill="var(--pc-cat)" fillRule="evenodd" /> : null}
    </>
  );
}

function RamPiece({ part, fill }: { part: RamPart; fill: string }): React.JSX.Element {
  const L = useLineSet(R, R.brush);
  return <Piece d={R.fills[part]} line={L.lines[part]} fill={fill} />;
}

function RamHead(): React.JSX.Element {
  const L = useLineSet(R, R.brush);
  return (
    <About p={R.pivots.neck} c="pc-sway">
      <About p={R.pivots.neck} c="pc-lean">
        <RamPiece part="hornL" fill="var(--pc-ram-horn)" />
        <RamPiece part="hornR" fill="var(--pc-ram-horn)" />
        <path d={L.ridges.hornL + L.ridges.hornR} fill="var(--pc-cat)" fillRule="evenodd" />
        <About p={R.pivots.earL} c="pc-ear pc-ear--l">
          <RamPiece part="earL" fill="var(--pc-ram)" />
        </About>
        <About p={R.pivots.earR} c="pc-ear pc-ear--r">
          <RamPiece part="earR" fill="var(--pc-ram)" />
        </About>
        <RamPiece part="head" fill="var(--pc-ram)" />
        <g className="pc-face">
          <RamPiece part="muzzle" fill="var(--pc-cream)" />
          <g fill="var(--pc-cat)" fillRule="evenodd">
            <path className="pc-nose" d={L.mouth} />
            {L.eyes.map((d) => (
              <path key={d.slice(0, 24)} className="pc-eye" d={d} />
            ))}
          </g>
        </g>
      </About>
    </About>
  );
}

/* the chest and the paws, and the pudding under them */
function RamFront({ pudding = true }: { pudding?: boolean }): React.JSX.Element {
  return (
    <>
      {pudding ? (
        <>
          <RamPiece part="custard" fill="var(--pc-custard)" />
          <RamPiece part="caramel" fill="var(--pc-caramel)" />
        </>
      ) : null}
      <RamPiece part="chest" fill="var(--pc-ram)" />
    </>
  );
}

function Body({ id }: { id: string }): React.JSX.Element {
  if (useContext(AnimalContext) === 'cat') return <CatBody id={id} />;
  return (
    <>
      <RamFront pudding={false} />
      <RamHead />
    </>
  );
}

function PuddingBody({ rim, halo = false }: { rim: string; halo?: boolean }): React.JSX.Element {
  const brushed = useContext(LinesContext) === 'brushed';
  if (useContext(AnimalContext) === 'ram') {
    /* the pudding of the ram alone: its outline, with the parts under the paws filled */
    return (
      <About p={R.pivots.pudding} c="pc-pud">
        {halo ? (
          <path
            d={R.puddingHull}
            fill="none"
            stroke="var(--pc-ground, #f4f2ed)"
            strokeWidth={26 + R.lineWidth}
            strokeLinejoin="round"
          />
        ) : null}
        <path d={R.puddingHull} fill="var(--pc-caramel)" />
        <RamPiece part="custard" fill="var(--pc-custard)" />
        <RamPiece part="caramel" fill="var(--pc-caramel)" />
        {brushed ? (
          <path d={R.brush.hull} fill="var(--pc-cat)" fillRule="evenodd" />
        ) : (
          <path
            d={R.puddingHull}
            fill="none"
            stroke="var(--pc-cat)"
            strokeWidth={R.lineWidth}
            strokeLinejoin="round"
          />
        )}
      </About>
    );
  }
  return (
    <About p={P.puddingPivot} c="pc-pud">
      {/* a line in the colour of the ground, as the gap of the mark */}
      {halo ? (
        <path
          d={P.pudding}
          fill="none"
          stroke="var(--pc-ground, #f4f2ed)"
          strokeWidth={26}
          strokeLinejoin="round"
        />
      ) : null}
      <path d={P.pudding} fill="var(--pc-custard)" />
      <path d={P.caramel} fill="var(--pc-caramel)" fillRule="evenodd" clipPath={`url(#${rim})`} />
    </About>
  );
}

/* ---------- the ram with a croissant ----------
   Two more poses of the ram: it eats a croissant while it waits, and it hugs one when the
   work is done. The whole ram sways about its feet, its ears flick and its eyes squeeze.
   When it eats, the croissant and the paws go up to the mouth; when it hugs, it squeezes. */

/* a pose: its solid lines, and the same lines brushed */
type Pose = LineSet & {
  readonly fills: Readonly<Record<string, string>>;
  readonly order: readonly string[];
  readonly pivots: { readonly feet: Pt; readonly earL: Pt; readonly earR: Pt };
  readonly box: string;
  readonly brush: LineSet;
};

const POSES: Record<'eat' | 'hug', Pose> = { eat: RAM_EAT, hug: RAM_HUG };

const POSE_FILL: Readonly<Record<string, string>> = {
  hornL: 'var(--pc-ram-horn)',
  hornR: 'var(--pc-ram-horn)',
  earL: 'var(--pc-ram)',
  earR: 'var(--pc-ram)',
  body: 'var(--pc-ram)',
  pawL: 'var(--pc-ram)',
  pawR: 'var(--pc-ram)',
  muzzle: 'var(--pc-cream)',
  chin: 'var(--pc-cream)',
  crumbs: 'var(--pc-bread)',
  bread: 'var(--pc-bread)',
  crust: 'var(--pc-crust)',
};

/* the croissant and the paws that hold it, in front of the face */
const HELD = new Set(['bread', 'crust', 'pawL', 'pawR']);

export function RamPose({
  pose,
  className = '',
}: {
  pose: 'eat' | 'hug';
  className?: string;
}): React.JSX.Element {
  const P = POSES[pose];
  const L = useLineSet(P, P.brush);
  const part = (n: string): React.JSX.Element => {
    const piece = <Piece key={n} d={P.fills[n]} line={L.lines[n]} fill={POSE_FILL[n]} />;
    if (n === 'earL' || n === 'earR') {
      return (
        <About key={n} p={P.pivots[n]} c={`pc-ear pc-ear--${n === 'earL' ? 'l' : 'r'}`}>
          {piece}
        </About>
      );
    }
    if (n === 'hornL') {
      return (
        <React.Fragment key={n}>
          {piece}
          <path d={L.ridges.hornL + L.ridges.hornR} fill="var(--pc-cat)" fillRule="evenodd" />
        </React.Fragment>
      );
    }
    return piece;
  };
  return (
    <svg className={`pc pc-pose pc-pose--${pose} ${className}`} viewBox={P.box} aria-hidden>
      <About p={P.pivots.feet} c="pc-sway">
        <About p={P.pivots.feet} c="pc-squeeze">
          {P.order.filter((n) => !HELD.has(n)).map(part)}
          <g fill="var(--pc-cat)" fillRule="evenodd">
            <path d={L.mouth} />
            {L.eyes.map((d) => (
              <path key={d.slice(0, 24)} className="pc-eye" d={d} />
            ))}
          </g>
          <g className="pc-chew">{P.order.filter((n) => HELD.has(n)).map(part)}</g>
        </About>
      </About>
    </svg>
  );
}

/* The stamp with the ram: the pudding lands, the ram climbs up behind it, then it puts its
   paws on the pudding. The body shows only above the rim of the pudding, so it comes up from
   behind it; the paws drop in over the rim, in front of the pudding. */
function RamClimb({ viewBox, className }: { viewBox: string; className: string }): React.JSX.Element {
  const id = useId();
  return (
    <svg className={`pc ${className}`} viewBox={viewBox} aria-hidden>
      <defs>
        <clipPath id={`${id}-above`}>
          <path d={R.grab.above} />
        </clipPath>
        <clipPath id={`${id}-below`}>
          <path d={R.grab.below} />
        </clipPath>
        <clipPath id={`${id}-paws`}>
          <path d={R.grab.region} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-above)`}>
        <g className="pc-rise">
          <RamFront pudding={false} />
          <RamHead />
        </g>
      </g>
      <PuddingBody rim={`${id}-rim`} />
      <g clipPath={`url(#${id}-below)`}>
        <g className="pc-rise">
          <g className="pc-grab">
            <g clipPath={`url(#${id}-paws)`}>
              <RamPiece part="chest" fill="var(--pc-ram)" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

/** The whole mark. With `rise`, the animal comes up from behind the pudding. */
export function Mark({
  viewBox = MARK_BOX,
  className = '',
  rise = false,
}: {
  viewBox?: string;
  className?: string;
  rise?: boolean;
}): React.JSX.Element {
  const id = useId();
  const animal = useContext(AnimalContext);
  if (animal === 'ram') {
    if (rise) return <RamClimb viewBox={frame(animal, viewBox)} className={className} />;
    return (
      <svg className={`pc ${className}`} viewBox={frame(animal, viewBox)} aria-hidden>
        <About p={R.pivots.pudding} c="pc-pud">
          <RamFront />
          <RamHead />
        </About>
      </svg>
    );
  }
  const gap = `${id}-gap`;
  const rim = `${id}-rim`;
  const ground = `${id}-ground`;
  return (
    <svg className={`pc ${className}`} viewBox={frame(animal, viewBox)} aria-hidden>
      <defs>
        <mask id={gap} maskUnits="userSpaceOnUse" x={-200} y={-200} width={1424} height={1424}>
          <rect x={-200} y={-200} width={1424} height={1424} fill="#fff" />
          <About p={P.puddingPivot} c="pc-pud">
            <path d={P.gap} fill="#000" />
          </About>
        </mask>
        <clipPath id={rim}>
          <path d={P.pudding} />
        </clipPath>
        <EarClips id={id} />
        {/* nothing of the animal shows under the line that it sits on */}
        <clipPath id={ground}>
          <rect x={-200} y={-400} width={1424} height={400 + P.catPivot[1] + 6} />
        </clipPath>
      </defs>
      <g mask={`url(#${gap})`}>
        {rise ? (
          <g clipPath={`url(#${ground})`}>
            <g className="pc-rise">
              <Body id={id} />
            </g>
          </g>
        ) : (
          <Body id={id} />
        )}
      </g>
      <PuddingBody rim={rim} />
    </svg>
  );
}

/** The cat alone, with the part behind the pudding filled. */
export function Cat({
  viewBox = '167 137 660 668',
  className = '',
}: {
  viewBox?: string;
  className?: string;
}): React.JSX.Element {
  const id = useId();
  const animal = useContext(AnimalContext);
  return (
    <svg className={`pc ${className}`} viewBox={frame(animal, viewBox)} aria-hidden>
      <defs>
        <EarClips id={id} />
      </defs>
      <Body id={id} />
    </svg>
  );
}

/** The pudding alone. With `halo`, a line in the colour of the ground goes round it. */
export function Pudding({
  className = '',
  halo = false,
}: {
  className?: string;
  halo?: boolean;
}): React.JSX.Element {
  const rim = `${useId()}-rim`;
  const animal = useContext(AnimalContext);
  return (
    <svg className={`pc ${className}`} viewBox={frame(animal, '246 612 480 296')} aria-hidden>
      <defs>
        <clipPath id={rim}>
          <path d={P.pudding} />
        </clipPath>
      </defs>
      <PuddingBody rim={rim} halo={halo} />
    </svg>
  );
}

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));

/* the centre of the face, as parts of the mark's square */
export const FACE: Pt = [0.5, 0.41];

/**
 * The cat in `ref` leans and looks at the pointer. `face` is the centre of the
 * face as parts of the element's width and height. The loop runs only while
 * the look still changes, so a still page costs no script.
 */
export function useLook(
  ref: React.RefObject<HTMLElement | null>,
  { face = FACE, reach = 1, lean = 4.5 }: { face?: Pt; reach?: number; lean?: number } = {},
): void {
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let target = { x: 0, y: 0 };
    const now = { x: 0, y: 0, lean: 0 };
    let frame = 0;
    const step = (): void => {
      now.x += (target.x - now.x) * 0.14;
      now.y += (target.y - now.y) * 0.14;
      now.lean += (target.x * -lean - now.lean) * 0.1;
      el.style.setProperty('--lx', `${(now.x * 34).toFixed(1)}px`);
      el.style.setProperty('--ly', `${(now.y * 22).toFixed(1)}px`);
      el.style.setProperty('--lean', `${now.lean.toFixed(2)}deg`);
      const settled =
        Math.abs(target.x - now.x) < 0.004 &&
        Math.abs(target.y - now.y) < 0.004 &&
        Math.abs(target.x * -lean - now.lean) < 0.02;
      frame = settled ? 0 : requestAnimationFrame(step);
    };
    const onMove = (event: PointerEvent): void => {
      const box = el.getBoundingClientRect();
      if (box.bottom < -200 || box.top > window.innerHeight + 200) return;
      const dx = event.clientX - (box.left + box.width * face[0]);
      const dy = event.clientY - (box.top + box.height * face[1]);
      const span = Math.max(box.width, 160) * reach;
      target = { x: clamp(dx / span, -1, 1), y: clamp(dy / span, -1, 1) };
      if (!frame) frame = requestAnimationFrame(step);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [ref, face, reach, lean]);
}
