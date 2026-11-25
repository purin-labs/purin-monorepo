import '@/app.css';
import '@fontsource/hanken-grotesk/300.css';
import '@fontsource/hanken-grotesk/400.css';
import '@fontsource/hanken-grotesk/500.css';
import '@fontsource/hanken-grotesk/600.css';
import '@fontsource/hanken-grotesk/700.css';
import '@/styles/h2.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { EcosystemField } from '@/components/h2/EcosystemField';
import { InkDrawing } from '@/components/h2/ink/InkScene';
import { goatCatScene } from '@/components/h2/ink/catScenes';
import { goatScene, keyScene, stalkScene } from '@/components/h2/ink/scenes';
import NavbarCompact from '@/components/Navbar/NavbarCompact';
import { ProductTour } from '@/components/h2/ProductTour';
import { useSiteRouter } from '@/app/router/useSiteRouter';
import { SitePageContext, useSiteCopy } from '@/i18n/browser';
import { parseSitePage } from '@/i18n/locale';
import { PAPER_LIGHT_COLORS } from '@/context/siteColors';
import { ContactModalHost } from '@/components/contact/ContactModal';
import { CONTACT_LINK_TARGET } from '@/components/contact/contactLink';
import {
  H2Cta,
  H2Duo,
  H2Ecosystem,
  H2Footer,
  H2Pillars,
  H2WalletBand,
} from '@/components/h2/sections';
import '@/i18n/styles.css';
import {
  type Animal,
  AnimalContext,
  Cat,
  FACE,
  type Lines,
  LinesContext,
  Mark,
  Pudding,
  RamPose,
  useLook,
} from './cat';
import ramIcon from './ram-icon.svg?url';
import { R } from './ram-paths';
import ramWordmark from './ram-wordmark.svg?url';
import './home-cat.css';

/* Concept: the front page, with the Purin cat in six parts of the interface.
   The ink is the world and the flat mark is the signature.
   1 avatar (hero chip)  2 ink cat (hero drawing: it follows the goat and watches the kite)
   3 progress (the cat stalks the end of the tour timer line)
   4 stamp (closing banner)  5 loader (integrations banner)  6 guide (page corner) */

const reducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* true while the element is on screen, so a loop that nobody sees stops */
function useInView(ref: React.RefObject<HTMLElement | null>, margin = '0px'): boolean {
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const watch = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: margin,
    });
    watch.observe(el);
    return () => watch.disconnect();
  }, [ref, margin]);
  return inView;
}

/* pairs of [seconds, value]; the value eases from one pair to the next */
type Key = readonly [number, number];
const track =
  (keys: readonly Key[]) =>
  (t: number): number => {
    let i = 1;
    while (i < keys.length - 1 && t > keys[i][0]) i += 1;
    const [t0, v0] = keys[i - 1];
    const [t1, v1] = keys[i];
    const u = Math.max(0, Math.min(1, (t - t0) / (t1 - t0)));
    return v0 + (v1 - v0) * u * u * (3 - 2 * u);
  };

/* The cat is behind the tour's timer line, and it stalks the moving end of the
   line as a cat stalks its prey: it stays low, it creeps, it wiggles, and it
   pounces to the pudding at the end of the feature. The times are seconds of
   a 6.5 second feature. */
const LOW = 0.5; /* the part of the cat over the line while it stalks: the eyes, no more */
const STALK = {
  seconds: 6.5,
  wiggle: 4.5,
  pounce: 5.1,
  land: 5.44,
  /* the place: 0 is the start of the feature, 1 is behind the pudding.
     The cat goes forward low, then it stops to watch. */
  along: track([
    [0, 0], [0.9, 0], [1.5, 0.14],
    [2.1, 0.14], [2.9, 0.36],
    [3.5, 0.36], [4.3, 0.6], [6.5, 0.6],
  ]),
  /* The cat comes up one time. Then it stays low: it does not move up or
     down when the line runs or stops. Only its eyes follow the line. */
  height: track([
    [0, 0], [0.3, 0], [0.6, LOW],
    [4.5, LOW], [5.1, 0.42],
    [5.3, 0.97], [5.44, 0.84], [5.6, 0.9],
    [6.3, 0.9], [6.5, 0],
  ]),
  /* a slow blink after the catch */
  eyelid: track([[0, 1], [5.75, 1], [5.95, 0.1], [6.05, 0.1], [6.25, 1], [6.5, 1]]),
  /* one ear listens while the cat watches */
  twitches: [
    [1.8, 'is-twitch-l'],
    [3.2, 'is-twitch-r'],
  ],
} as const;

function TourRider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const riderRef = React.useRef<HTMLDivElement>(null);
  const goalRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef);

  React.useEffect(() => {
    const root = rootRef.current;
    const rider = riderRef.current;
    const goal = goalRef.current;
    if (!root || !rider || !goal || !inView || reducedMotion()) return undefined;
    let frame = 0;
    let before = 0;
    const restart = (el: HTMLElement, name: string, ...others: string[]): void => {
      el.classList.remove(name, ...others);
      void el.offsetWidth;
      el.classList.add(name);
    };
    /* the place of the cat: it stalks, then it leaps to the pudding, fast at the start */
    const place = (t: number): number => {
      if (t < STALK.pounce + 0.04) return STALK.along(t);
      const u = Math.min(1, (t - STALK.pounce - 0.04) / (STALK.land - STALK.pounce - 0.04));
      const from = STALK.along(STALK.pounce);
      return from + (1 - from) * (1 - (1 - u) ** 3);
    };
    const tick = (): void => {
      const line = root.querySelector<HTMLElement>('.h2-tour-feature.is-active .h2-tour-line');
      const feature = line?.closest<HTMLElement>('.h2-tour-feature');
      if (line && feature && line.offsetWidth) {
        const box = root.getBoundingClientRect();
        const l = line.getBoundingClientRect();
        const f = feature.getBoundingClientRect();
        /* the time of the feature, from the length of its timer line */
        const t = (l.width / line.offsetWidth) * STALK.seconds;
        const top = l.top - box.top;
        const start = f.left - box.left + 42;
        const end = f.right - box.left - 34;
        const x = start + (end - start) * place(t);
        const speed = (place(t + 0.05) - place(t - 0.05)) / 0.1;
        const up = STALK.height(t);
        const caught = t >= STALK.land;
        /* the eyes hold the end of the line; after the catch, they look down at the pudding */
        const aim = caught ? 0 : Math.max(-1, Math.min(1, (l.right - box.left - x) / 110));
        /* the wiggle: a few fast steps from side to side, low */
        const wig =
          t > STALK.wiggle && t < STALK.pounce
            ? Math.sin((t - STALK.wiggle) * Math.PI * 2 * 6.5) *
              Math.min(1, (t - STALK.wiggle) / 0.12, (STALK.pounce - t) / 0.06) *
              2.2
            : 0;
        rider.style.transform = `translate(${(x + wig).toFixed(1)}px, ${top.toFixed(1)}px)`;
        rider.style.setProperty('--up', up.toFixed(3));
        rider.style.setProperty('--lx', `${(aim * 32).toFixed(1)}px`);
        rider.style.setProperty('--ly', `${caught ? 12 : 4}px`);
        rider.style.setProperty('--lean', `${Math.max(-14, Math.min(4, -speed * 9)).toFixed(2)}deg`);
        rider.style.setProperty('--eye', STALK.eyelid(t).toFixed(3));
        rider.classList.toggle('is-low', t > 0.95 && t < STALK.pounce);
        rider.classList.toggle('is-keen', t >= STALK.wiggle && t < 5.75);
        goal.style.transform = `translate(${end.toFixed(1)}px, ${top.toFixed(1)}px)`;
        for (const [at, name] of STALK.twitches) {
          if (before < at && t >= at) restart(rider, name, 'is-twitch-l', 'is-twitch-r');
        }
        if (before < STALK.land && t >= STALK.land) restart(goal, 'is-jiggle');
        before = t;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView]);

  return (
    <div ref={rootRef} className="hc-tour">
      {children}
      <div ref={riderRef} className="hc-tour__rider" aria-hidden>
        {/* a window that ends at the line: the cat shows only over the line */}
        <div className="hc-tour__hide">
          <div className="hc-tour__cat">
            <Cat />
          </div>
        </div>
      </div>
      <div ref={goalRef} className="hc-tour__goal" aria-hidden>
        <div className="hc-tour__sit">
          <Pudding halo />
        </div>
      </div>
    </div>
  );
}

/* ---------- hero: the avatar chip, and the ink cat that follows the goat ---------- */

function HcHero(): React.JSX.Element {
  const { linkProps } = useSiteRouter();
  const copy = useSiteCopy();
  const animal = React.useContext(AnimalContext);
  const contactProps = linkProps(CONTACT_LINK_TARGET);
  const pantryProps = linkProps('/ecommerce');
  const kitchenProps = linkProps('/ecommerce#kitchen');

  return (
    <>
      <header
        className="h2-hero-simple h2-hero-simple--panel h2-hero-simple--ink hc-hero"
        aria-labelledby="h2-home-title"
      >
        <div className="h2-shell">
          {/* the ink is the world: the goat leads the kite, and the cat follows and waits;
              when the ram is the mark, the ink goat leads alone */}
          <InkDrawing
            key={animal}
            scene={animal === 'ram' ? goatScene : goatCatScene}
            className="h2-ink--hero"
            drawn
          />
          <div className="h2-hero-simple__copy">
            <p className="hc-chip">
              <span className="hc-chip__disc" aria-hidden>
                <Mark viewBox="127 120 740 740" />
              </span>
              <span className="hc-chip__dot" aria-hidden />
              <span>
                <strong>Sous Chef</strong> is online in your shop
              </span>
            </p>
            <h1 id="h2-home-title" className="h2-display h2-hero-simple__title">
              <span>{copy.homeHero.title}</span>{' '}
              <span className="h2-hero-simple__title-muted">{copy.homeHero.titleMuted}</span>
            </h1>
            <p className="h2-hero-simple__sub">{copy.homeHero.sub}</p>
            <div className="h2-hero-simple__ctas">
              <a
                className="h2-btn h2-btn--primary h2-btn--lg"
                href={contactProps.href}
                onClick={contactProps.onClick}
              >
                {copy.common.talkToUs}
              </a>
              <a
                className="h2-btn h2-btn--outline h2-btn--lg"
                href={pantryProps.href}
                onClick={pantryProps.onClick}
              >
                {copy.common.exploreSatyr}
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="h2-rule h2-tour-band" aria-label={copy.tour.label}>
        <TourRider>
          <ProductTour links={{ satyr: pantryProps, kitchen: kitchenProps }} />
        </TourRider>
      </section>
    </>
  );
}

/* ---------- integrations banner: the cat looks in while a tool connects ---------- */

const TOOLS = ['Slack', 'Gmail', 'Shopify', 'Square', 'Stripe'] as const;

function LoaderArt(): React.JSX.Element {
  const ref = React.useRef<HTMLDivElement>(null);
  const animal = React.useContext(AnimalContext);
  const live = useInView(ref);
  const [tool, setTool] = React.useState(0);
  return (
    <div
      ref={ref}
      className={`h2-ink h2-ink--banner hc-art hc-loader${live ? ' is-live' : ''}`}
      aria-hidden
    >
      {/* a new animal starts the loop again, so the ram, the bar and the labels keep in time */}
      <div className="hc-art__fit" key={animal}>
        <div
          className="hc-loader__cat"
          style={{ '--lx': '-24px', '--ly': '16px' } as React.CSSProperties}
        >
          {/* the ram eats a croissant while the tool connects: each bite fills a step of the bar */}
          {animal === 'ram' ? <RamPose pose="eat" /> : <Cat />}
        </div>
        <div className="hc-slip hc-loader__slip">
          <span className="hc-loader__labels">
            <span className="hc-loader__label hc-loader__label--a">Connecting {TOOLS[tool]}</span>
            <span className="hc-loader__label hc-loader__label--b">{TOOLS[tool]} is connected</span>
          </span>
          <div className="hc-bar">
            <div
              className="hc-bar__fill"
              onAnimationIteration={() => setTool((n) => (n + 1) % TOOLS.length)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- closing banner: the pudding stamps the approval, then the cat comes up ---------- */

const FLECKS: readonly { x: number; y: number; size: number; colour: string }[] = [
  { x: -11, y: -7, size: 1.5, colour: 'var(--pc-custard)' },
  { x: 12, y: -8, size: 1, colour: 'var(--pc-cat)' },
  { x: -12.5, y: 6.5, size: 1.1, colour: 'var(--pc-caramel)' },
  { x: 12, y: 7, size: 1.3, colour: 'var(--pc-custard)' },
  { x: 1.5, y: -13.5, size: 0.9, colour: 'var(--pc-caramel)' },
];

function StampArt(): React.JSX.Element {
  const ref = React.useRef<HTMLDivElement>(null);
  const live = useInView(ref, '-12% 0px');
  const arc = React.useId();
  /* a press on Approve starts the stamp again */
  const [run, setRun] = React.useState(0);
  return (
    <div ref={ref} className={`h2-ink h2-ink--banner hc-art hc-stamp${live ? ' is-live' : ''}`}>
      <div className="hc-art__fit" key={run}>
        <div className="hc-slip hc-stamp__slip">
          <span className="hc-stamp__what">Refund ¥2,400</span>
          <span className="hc-stamp__who">Order 1042</span>
          <span className="hc-stamp__state">
            <span className="hc-stamp__state-a">Waits for you</span>
            <span className="hc-stamp__state-b">Approved by you</span>
          </span>
          <button type="button" className="hc-stamp__btn" onClick={() => setRun((n) => n + 1)}>
            Approve
          </button>
        </div>
        <div className="hc-seal" aria-hidden>
          <span className="hc-seal__shock" />
          {FLECKS.map((fleck, index) => (
            <i
              key={index}
              className="hc-seal__fleck"
              style={
                {
                  '--fx': `${fleck.x}cqw`,
                  '--fy': `${fleck.y}cqw`,
                  '--fs': `${fleck.size}cqw`,
                  '--fc': fleck.colour,
                } as React.CSSProperties
              }
            />
          ))}
          <div className="hc-seal__tilt">
            <svg className="hc-seal__print" viewBox="0 0 200 200">
              {/* a cream ground, so that the seal reads on the slip and on the paint */}
              <circle cx="100" cy="100" r="93" fill="var(--pc-cream)" stroke="var(--pc-cat)" strokeWidth="5" />
              <circle cx="100" cy="100" r="85" fill="none" stroke="var(--pc-cat)" strokeWidth="1.4" />
              <defs>
                <path id={arc} d="M 31 100 A 69 69 0 0 1 169 100" />
              </defs>
              <text>
                <textPath href={`#${arc}`} startOffset="50%" textAnchor="middle">
                  APPROVED
                </textPath>
              </text>
            </svg>
            <div className="hc-seal__mark">
              <Mark rise />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- the guide: the cat in the page corner explains the section in view ---------- */

const GUIDE: readonly { at: string; says: string }[] = [
  { at: '.hc-hero', says: 'Hello. I am Sous Chef.' },
  { at: '.h2-tour-band', says: 'I draft the reply. You approve it.' },
  { at: '#h2-duo-title', says: 'The shop and the oven use the same orders.' },
  { at: '#h2-eco-title', says: 'I work in the tools that you use now.' },
  { at: '#h2-pillars-title', says: 'Pick a part. I show you its screen.' },
  { at: '#h2-wallet-title', says: 'This one pays in stablecoins.' },
  { at: '#h2-cta-title', says: 'Ready? Talk to us.' },
];

const GUIDE_LOOK = { face: FACE, reach: 2.4, lean: 3 } as const;

function Guide(): React.JSX.Element {
  const catRef = React.useRef<HTMLButtonElement>(null);
  const animal = React.useContext(AnimalContext);
  const [step, setStep] = React.useState(0);
  const [quiet, setQuiet] = React.useState(false);
  useLook(catRef, GUIDE_LOOK);

  React.useEffect(() => {
    let frame = 0;
    const read = (): void => {
      frame = 0;
      const line = window.innerHeight * 0.62;
      let next = 0;
      GUIDE.forEach((entry, index) => {
        const el = document.querySelector(entry.at);
        if (el && el.getBoundingClientRect().top < line) next = index;
      });
      setStep(next);
    };
    const onScroll = (): void => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <aside
      className={`hc-guide${quiet ? ' is-quiet' : ''}${step === 0 ? ' is-away' : ''}`}
      aria-label="Sous Chef guide"
    >
      {quiet ? null : (
        <p className="hc-guide__bubble" key={step} aria-live="polite">
          {GUIDE[step].says}
        </p>
      )}
      <button
        ref={catRef}
        type="button"
        className="hc-guide__cat"
        onClick={() => setQuiet((value) => !value)}
        aria-label={quiet ? 'Show the guide text' : 'Hide the guide text'}
      >
        {/* the cat nods each time that it says something new; at the end of the page
            the ram hugs a croissant */}
        <span className="hc-guide__nod" key={step}>
          {animal === 'ram' && step === GUIDE.length - 1 ? <RamPose pose="hug" /> : <Mark />}
        </span>
      </button>
    </aside>
  );
}

/* ---------- the switches: the cat or the ram as the mark, and how the ram's lines are drawn ---------- */

const ANIMALS: readonly { value: Animal; label: string }[] = [
  { value: 'cat', label: 'Cat' },
  { value: 'ram', label: 'Ram' },
];

const LINES: readonly { value: Lines; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'brushed', label: 'Brushed' },
];

/* How the page shows the mark. The address keeps it: `#ram`, or `#ram-brushed`. */
type Look = { readonly animal: Animal; readonly lines: Lines };

const startLook = (): Look => {
  const parts = window.location.hash.slice(1).split('-');
  return {
    animal: parts[0] === 'ram' ? 'ram' : 'cat',
    lines: parts.includes('brushed') ? 'brushed' : 'solid',
  };
};

const lookHash = (look: Look): string => (look.lines === 'brushed' ? '#ram-brushed' : '#ram');

function Switch<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (next: T) => void;
}): React.JSX.Element {
  return (
    <div className="hc-switch" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="hc-switch__option"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- the page ---------- */

function HomeCatPage({
  look,
  onLook,
}: {
  look: Look;
  onLook: (next: Look) => void;
}): React.JSX.Element {
  const ram = look.animal === 'ram';
  return (
    <div
      className={`h2-page hc${ram ? ' is-ram' : ''}`}
      style={
        ram
          ? ({
              '--hc-wordmark': `url("${ramWordmark}")`,
              '--hc-wordmark-ratio': R.wordmarkRatio,
            } as React.CSSProperties)
          : undefined
      }
    >
      <NavbarCompact appearance="light" />
      <div className="h2-col">
        <HcHero />
        <H2Duo />
        <H2Ecosystem drawing={<LoaderArt />} tools={<EcosystemField />} />
        <H2Pillars drawing={<InkDrawing scene={stalkScene} className="h2-ink--banner" />} />
        <H2WalletBand drawing={<InkDrawing scene={keyScene} className="h2-ink--banner" />} />
        <H2Cta audience="home" drawing={<StampArt />} />
        <H2Footer faq="home" />
      </div>
      <Guide />
      <div className="hc-switches">
        <Switch
          label="Mark"
          value={look.animal}
          options={ANIMALS}
          onChange={(animal) => onLook({ ...look, animal })}
        />
        {ram ? (
          <Switch
            label="Lines of the ram"
            value={look.lines}
            options={LINES}
            onChange={(lines) => onLook({ ...look, lines })}
          />
        ) : null}
      </div>
    </div>
  );
}

function Shell(): React.JSX.Element {
  const sitePage = React.useMemo(() => parseSitePage('/'), []);
  const [look, setLook] = React.useState<Look>(startLook);
  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-seams-theme', 'light');
    document.body.setAttribute('data-seams-theme', 'light');
    for (const [name, value] of Object.entries(PAPER_LIGHT_COLORS)) {
      root.style.setProperty(`--seams-colors-${name}`, value);
    }
  }, []);
  /* the favicon and the address follow the switch */
  React.useEffect(() => {
    const ram = look.animal === 'ram';
    const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (icon) icon.href = ram ? ramIcon : '/brand/favicon.svg';
    window.history.replaceState(null, '', ram ? lookHash(look) : window.location.pathname);
  }, [look]);
  return (
    <SitePageContext.Provider value={sitePage}>
      <AnimalContext.Provider value={look.animal}>
        <LinesContext.Provider value={look.lines}>
          <HomeCatPage look={look} onLook={setLook} />
          <ContactModalHost />
        </LinesContext.Provider>
      </AnimalContext.Provider>
    </SitePageContext.Provider>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<Shell />);
