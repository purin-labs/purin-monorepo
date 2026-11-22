import React, { useId } from 'react';
import { P } from './paths';

/* The Purin mark as parts that move: the cat, its ears, its face, its eyes and the pudding.
   Every shape is a traced curve of the logo. */

type Pt = readonly [number, number];

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

function PuddingBody({ rim, halo = false }: { rim: string; halo?: boolean }): React.JSX.Element {
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

export const MARK_BOX = '67 97 860 860';

/** The whole mark. With `rise`, the cat comes up from under the pudding. */
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
  const gap = `${id}-gap`;
  const rim = `${id}-rim`;
  const ground = `${id}-ground`;
  return (
    <svg className={`pc ${className}`} viewBox={viewBox} aria-hidden>
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
        {/* nothing of the cat shows under the line that it sits on */}
        <clipPath id={ground}>
          <rect x={-200} y={-400} width={1424} height={400 + P.catPivot[1] + 6} />
        </clipPath>
      </defs>
      <g mask={`url(#${gap})`}>
        {rise ? (
          <g clipPath={`url(#${ground})`}>
            <g className="pc-rise">
              <CatBody id={id} />
            </g>
          </g>
        ) : (
          <CatBody id={id} />
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
  return (
    <svg className={`pc ${className}`} viewBox={viewBox} aria-hidden>
      <defs>
        <EarClips id={id} />
      </defs>
      <CatBody id={id} />
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
  return (
    <svg className={`pc ${className}`} viewBox="246 612 480 296" aria-hidden>
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

/* the centre of the face and of the pudding, as parts of the mark's square */
export const FACE: Pt = [0.5, 0.41];
export const PUDDING_AT: Pt = [0.49, 0.77];

/** Restarts the pudding wobble on an element. */
export function jiggle(el: HTMLElement): void {
  el.classList.remove('is-jiggle');
  void el.offsetWidth;
  el.classList.add('is-jiggle');
}

/**
 * The cat in `ref` leans and looks at the pointer. `face` is the centre of the
 * face as parts of the element's width and height. The loop runs only while
 * the look still changes, so a still page costs no script.
 */
export function useLook(
  ref: React.RefObject<HTMLElement | null>,
  { face = FACE, reach = 1, lean = 4.5, travel = 1, pudding }: {
    face?: Pt;
    reach?: number;
    lean?: number;
    /* how far the face goes, as a part of the usual distance */
    travel?: number;
    /* the centre of the pudding, to make it jiggle under the pointer */
    pudding?: Pt;
  } = {},
): void {
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let target = { x: 0, y: 0 };
    const now = { x: 0, y: 0, lean: 0 };
    let frame = 0;
    let lastJiggle = 0;
    const step = (): void => {
      now.x += (target.x - now.x) * 0.14;
      now.y += (target.y - now.y) * 0.14;
      now.lean += (target.x * -lean - now.lean) * 0.1;
      el.style.setProperty('--lx', `${(now.x * 34 * travel).toFixed(1)}px`);
      el.style.setProperty('--ly', `${(now.y * 22 * travel).toFixed(1)}px`);
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
      if (pudding) {
        const near =
          Math.hypot(
            event.clientX - (box.left + box.width * pudding[0]),
            event.clientY - (box.top + box.height * pudding[1]),
          ) <
          box.width * 0.2;
        el.classList.toggle('is-keen', near);
        if (near && event.timeStamp - lastJiggle > 1100) {
          lastJiggle = event.timeStamp;
          jiggle(el);
        }
      }
      if (!frame) frame = requestAnimationFrame(step);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [ref, face, reach, lean, travel, pudding]);
}
