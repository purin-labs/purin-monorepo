import { useSiteCopy, useTranslation } from '@/i18n/browser';
import type { Translate } from '@/i18n/catalog';
import type { SiteCopy } from '@/i18n/siteCopy';
import { LanguageSelector } from '@/i18n/LanguageSelector';
import React from 'react';
import { ChevronDown } from 'lucide-react';
import PurinWordmark from '@/components/icons/PurinWordmark';
import { ArrowRightAnim } from '@/components/ArrowRightAnim';
import { GrainField, type GrainFieldName } from '@seams-internal/grain-field';
import { InkDrawing } from '@/components/h2/ink/InkScene';
import { BrushSwatch, type SwatchColour, type SwatchLayers } from '@/components/h2/ink/BrushSwatch';
import { tileSignScenes, type TileSign } from '@/components/h2/ink/tileSignScenes';
import { PortalShot, type PortalShotName } from '@/components/h2/SceneHero';
import { KitchenTile, ShopTile } from '@/components/h2/DuoTiles';
import { useSiteRouter } from '@/app/router/useSiteRouter';
import '@/styles/h2.css';
import { CONTACT_LINK_TARGET } from '@/components/contact/contactLink';

/* Shared section library for the h2 marketing pages (/, /ecommerce, /company, /branding).
   Every component renders inside a `.h2-page > .h2-col` wrapper and styles
   itself from src/styles/h2.css. */

/* ---------- banners and gradient tiles (as on the wallet site) ---------- */

type TileIcon = React.ComponentType<{ size?: number; strokeWidth?: number }>;

/* A white icon on a small tile of moving gradient, as in the navbar menus. */
export function FieldTile({ field, icon: Icon }: { field: GrainFieldName; icon: TileIcon }) {
  return (
    <span className="h2-fieldtile" aria-hidden>
      <GrainField field={field} />
      <Icon size={18} strokeWidth={1.7} />
    </span>
  );
}

/* A tile painted in ink, with its sign cut out. A pastel copy with the sign in
   ink waits under it and shows while the link, tab or card that holds it is
   under the pointer. */
export function InkTile({ sign }: { sign: TileSign }): React.JSX.Element {
  const scenes = tileSignScenes[sign];
  return (
    <span className="h2-inktile" aria-hidden>
      <InkDrawing scene={scenes.hover} className="h2-inktile__hover" drawn />
      <InkDrawing scene={scenes.ink} className="h2-inktile__ink" drawn />
    </span>
  );
}

/* A wide banner spreads each colour over its width, so the site's flow barely
   shows on it; this much more keeps its movement subtle but visible. */
const BANNER_FLOW = 3;

/* A grey banner that fades into a moving gradient while it is in view, and
   back to grey once it leaves. */
function FieldBanner({
  field,
  children,
}: {
  field: GrainFieldName;
  children: React.ReactNode;
}): React.JSX.Element {
  const ref = React.useRef<HTMLDivElement>(null);
  const [lit, setLit] = React.useState(false);

  React.useEffect(() => {
    const banner = ref.current;
    if (!banner || typeof IntersectionObserver === 'undefined') return undefined;
    /* the viewport's bottom edge counts as 12rem higher, so the fade starts
       once the banner has scrolled that much further in */
    const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    const observer = new IntersectionObserver(([entry]) => setLit(entry.isIntersecting), {
      rootMargin: `0px 0px ${-12 * rem}px 0px`,
      threshold: 0.5,
    });
    observer.observe(banner);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`h2-banner h2-banner--field${lit ? ' is-lit' : ''}`}>
      <GrainField field={field} playing={lit} flow={BANNER_FLOW} />
      {children}
    </div>
  );
}

/* A band heading: the banner card on its own ruled row, one inset inside
   the rules, with the heading left and the actions right. */
function BannerSection({
  id,
  anchor,
  field,
  drawing,
  swatch,
  layers,
  mirrored,
  title,
  sub,
  children,
}: {
  id: string;
  /* the fragment that links to this band, e.g. /ecommerce#kitchen */
  anchor?: string;
  field: GrainFieldName;
  /* a drawing on paper in place of the gradient field: the home page brings it,
     so the ink code and styles stay out of the pages that share these sections */
  drawing?: React.ReactNode;
  /* the brush stroke of paint under the drawing */
  swatch: SwatchColour;
  layers: SwatchLayers;
  mirrored: boolean;
  title: string;
  sub?: string;
  children?: React.ReactNode;
}): React.JSX.Element {
  const content = (
    <>
      <div>
        <h2 id={id} className="h2-display h2-banner__title">
          {title}
        </h2>
        {sub ? <p className="h2-banner__sub">{sub}</p> : null}
      </div>
      {children ? <div className="h2-banner__actions">{children}</div> : null}
    </>
  );

  return (
    <section id={anchor} className="h2-section h2-section--banner h2-rule" aria-labelledby={id}>
      {drawing ? (
        <div className="h2-banner h2-banner--ink">
          <BrushSwatch colour={swatch} layers={layers} mirrored={mirrored} />
          {drawing}
          {content}
        </div>
      ) : (
        <FieldBanner field={field}>{content}</FieldBanner>
      )}
    </section>
  );
}

/* ---------- ecosystem (integrations) ---------- */

export function H2Ecosystem({
  drawing,
  tools,
}: {
  drawing?: React.ReactNode;
  tools?: React.ReactNode;
} = {}): React.JSX.Element {
  const { linkProps } = useSiteRouter();
  const copy = useSiteCopy();
  const satyrProps = linkProps('/ecommerce');

  return (
    <>
      <BannerSection
        id="h2-eco-title"
        swatch="seaglass"
        layers={{
          kind: 'single',
          foreground: { paint: { finish: 'wet', stroke: 1 }, angle: -1, offset: 0 },
        }}
        mirrored={false}
        anchor="integrations"
        field="teal-peach"
        drawing={drawing}
        title={copy.ecosystem.title}
        sub={copy.ecosystem.sub}
      >
        <a className="h2-btn h2-btn--primary" href={satyrProps.href} onClick={satyrProps.onClick}>
          {copy.common.exploreSatyr}
          <ArrowRightAnim size={12} />
        </a>
      </BannerSection>
      <section
        className="h2-section h2-section--band h2-section--flush-bottom h2-rule"
        aria-labelledby="h2-eco-title"
      >
        <div className="h2-shell">{tools}</div>
      </section>
    </>
  );
}

/* ---------- platform pillars ---------- */

type Pillar = {
  id: string;
  label: string;
  sign: TileSign;
  copy: React.ReactNode;
  mock: React.ReactNode;
};

/* The suite's areas, one tab each, with the Portal's own screen for each
   area. */
function getPillars(text: SiteCopy['pillars']['items']): Pillar[] {
  return [
    {
      id: 'shop',
      label: text.shop.label,
      sign: 'shop',
      copy: (
        <>
          <strong>{text.shop.lead}</strong>
          {text.shop.rest}
        </>
      ),
      mock: <PortalShot shot="checkout" alt={text.shop.alt} className="h2-shot--card" />,
    },
    {
      id: 'orders',
      label: text.orders.label,
      sign: 'bag',
      copy: (
        <>
          <strong>{text.orders.lead}</strong>
          {text.orders.rest}
        </>
      ),
      mock: <PortalShot shot="orders" alt={text.orders.alt} className="h2-shot--card" />,
    },
    {
      id: 'inbox',
      label: text.inbox.label,
      sign: 'inbox',
      copy: (
        <>
          <strong>{text.inbox.lead}</strong>
          {text.inbox.rest}
        </>
      ),
      mock: <PortalShot shot="inbox" alt={text.inbox.alt} className="h2-shot--card" />,
    },
    {
      id: 'production',
      label: text.production.label,
      sign: 'croissant',
      copy: (
        <>
          <strong>{text.production.lead}</strong>
          {text.production.rest}
        </>
      ),
      mock: (
        <PortalShot
          shot="bakery-timeline"
          alt={text.production.alt}
          className="h2-shot--card h2-shot--bottom"
        />
      ),
    },
    {
      id: 'vault',
      label: text.vault.label,
      sign: 'key',
      copy: (
        <>
          <strong>{text.vault.lead}</strong>
          {text.vault.rest}
        </>
      ),
      mock: <PortalShot shot="vault" alt={text.vault.alt} className="h2-shot--card" />,
    },
  ];
}

export function H2Pillars({
  link = true,
  drawing,
}: { link?: boolean; drawing?: React.ReactNode } = {}): React.JSX.Element {
  const { linkProps } = useSiteRouter();
  const satyrProps = linkProps('/ecommerce');
  const copy = useSiteCopy();
  const pillars = React.useMemo(() => getPillars(copy.pillars.items), [copy]);
  const [active, setActive] = React.useState(0);
  const pillar = pillars[active];

  return (
    <>
      <BannerSection
        id="h2-pillars-title"
        swatch="blush"
        layers={{
          kind: 'single',
          foreground: { paint: { finish: 'dry', stroke: 2 }, angle: 1, offset: 0 },
        }}
        mirrored={true}
        anchor="suite"
        field="azure-coral"
        drawing={drawing}
        title={copy.pillars.title}
        sub={copy.pillars.sub}
      >
        {link ? (
          <a className="h2-btn h2-btn--primary" href={satyrProps.href} onClick={satyrProps.onClick}>
            {copy.common.exploreSatyr}
            <ArrowRightAnim size={12} />
          </a>
        ) : null}
      </BannerSection>
      <section className="h2-section h2-section--band h2-rule" aria-labelledby="h2-pillars-title">
        <div className="h2-shell">
          <div className="h2-pillars">
            <div className="h2-pillars__list" role="tablist" aria-label={copy.pillars.tablist}>
              {pillars.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  className={`h2-pillar${i === active ? ' is-active' : ''}`}
                  onClick={() => setActive(i)}
                >
                  <InkTile sign={p.sign} />
                  {p.label}
                </button>
              ))}
            </div>
            <div className="h2-pillars__panel" role="tabpanel" aria-label={pillar.label}>
              <p className="h2-pillars__panel-copy">{pillar.copy}</p>
              <div className="h2-pillars__mock">{pillar.mock}</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- bento band (approvals and receipts) ---------- */

function SlackApprovalMock(): React.JSX.Element {
  const text = useSiteCopy().bento.slack;
  return (
    <div className="h2-mockcard" role="img" aria-label={text.label}>
      <p className="h2-mockcard__title">{text.title}</p>
      <div className="h2-mockrow">
        <span className="h2-mockrow__main">
          {text.change}
          <small>{text.changeNote}</small>
        </span>
        <span className="h2-chip h2-chip--amber">{text.needed}</span>
      </div>
      <div className="h2-mockrow">
        <span className="h2-mockrow__main">
          {text.who}
          <small>{text.whoNote}</small>
        </span>
        <span className="h2-chip h2-chip--plain">{text.people}</span>
      </div>
      <div className="h2-mockbtns" aria-hidden>
        <span className="h2-mockbtn h2-mockbtn--approve">{text.approve}</span>
        <span className="h2-mockbtn h2-mockbtn--cancel">{text.decline}</span>
      </div>
    </div>
  );
}

function MoneyGateMock(): React.JSX.Element {
  const text = useSiteCopy().bento.money;
  return (
    <div className="h2-mockcard" role="img" aria-label={text.label}>
      <p className="h2-mockcard__title">{text.title}</p>
      <div className="h2-mockrow">
        <span className="h2-mockrow__main">
          {text.moves}
          <small>{text.movesNote}</small>
        </span>
        <span className="h2-chip h2-chip--amber">{text.held}</span>
      </div>
      <div className="h2-mockrow">
        <span className="h2-mockrow__main">
          {text.portal}
          <small>{text.portalNote}</small>
        </span>
        <span className="h2-chip h2-chip--plain">{text.waiting}</span>
      </div>
      <div className="h2-mockrow">
        <span className="h2-mockrow__main">
          {text.receipt}
          <small>{text.receiptNote}</small>
        </span>
        <span className="h2-chip h2-chip--plain">{text.auto}</span>
      </div>
    </div>
  );
}

export function H2Bento({ drawing }: { drawing?: React.ReactNode } = {}): React.JSX.Element {
  const text = useSiteCopy().bento;
  const cards = text.cards;
  return (
    <>
      <BannerSection
        id="h2-bento-title"
        swatch="clay"
        layers={{
          kind: 'double',
          background: { paint: { finish: 'wet', stroke: 1 }, angle: -2, offset: -28 },
          foreground: { paint: { finish: 'dry', stroke: 5 }, angle: 1, offset: 0 },
        }}
        mirrored={false}
        anchor="control"
        field="mauve-ember"
        drawing={drawing}
        title={text.title}
        sub={text.sub}
      />
      <section className="h2-section h2-section--bento h2-rule" aria-labelledby="h2-bento-title">
        <div className="h2-shell">
          <div className="h2-bento">
            <div className="h2-bento__card h2-bento__card--lg">
              <div className="h2-bento__visual">
                <SlackApprovalMock />
              </div>
              <div>
                <h3 className="h2-bento__title">{cards.thread.title}</h3>
                <p className="h2-bento__copy">{cards.thread.copy}</p>
              </div>
            </div>
            <div className="h2-bento__card h2-bento__card--lg">
              <div className="h2-bento__visual">
                <MoneyGateMock />
              </div>
              <div>
                <h3 className="h2-bento__title">{cards.money.title}</h3>
                <p className="h2-bento__copy">{cards.money.copy}</p>
              </div>
            </div>
            <div className="h2-bento__card h2-bento__card--sm">
              <InkTile sign="list" />
              <div>
                <h3 className="h2-bento__title">{cards.roles.title}</h3>
                <p className="h2-bento__copy">{cards.roles.copy}</p>
              </div>
            </div>
            <div className="h2-bento__card h2-bento__card--sm">
              <InkTile sign="receipt" />
              <div>
                <h3 className="h2-bento__title">{cards.receipts.title}</h3>
                <p className="h2-bento__copy">{cards.receipts.copy}</p>
              </div>
            </div>
            <div className="h2-bento__card h2-bento__card--sm">
              <InkTile sign="key" />
              <div>
                <h3 className="h2-bento__title">{cards.secrets.title}</h3>
                <p className="h2-bento__copy">{cards.secrets.copy}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- workflows (canvas + use-case covers) ---------- */

type UseCase = {
  title: string;
  field: GrainFieldName;
  coverLabel: string;
  cover: PortalShotName;
  copy: string;
};

type CaseLayout = Omit<UseCase, 'title' | 'coverLabel' | 'copy'>;

function withText<K extends string>(
  layouts: Record<K, CaseLayout>,
  text: Record<K, { title: string; coverLabel: string; copy: string }>,
): UseCase[] {
  return (Object.keys(layouts) as K[]).map((key) => ({ ...layouts[key], ...text[key] }));
}

const useCaseLayouts: Record<keyof SiteCopy['cases']['items'], CaseLayout> = {
  shop: { field: 'sky-sand', cover: 'cover-shop' },
  inbox: { field: 'aqua-evergreen', cover: 'cover-inbox' },
  orders: { field: 'azure-coral', cover: 'cover-orders' },
};

function UseCaseCards({ cases }: { cases: readonly UseCase[] }): React.JSX.Element {
  return (
    <div className="h2-cases">
      {cases.map((c) => (
        <div className="h2-case" key={c.title}>
          <div className="h2-case__cover">
            <GrainField field={c.field} />
            <span aria-hidden>{c.coverLabel}</span>
            <PortalShot shot={c.cover} alt="" />
          </div>
          <h3 className="h2-case__title">{c.title}</h3>
          <p className="h2-case__copy">{c.copy}</p>
        </div>
      ))}
    </div>
  );
}

export function H2WorkflowCanvas(): React.JSX.Element {
  const text = useSiteCopy().cases.flow;
  return (
    <div className="h2-flow">
      <div className="h2-flow__canvas" role="img" aria-label={text.label}>
        <span className="h2-flow__tag">{text.tag}</span>
        <div className="h2-flow__row">
          <div className="h2-mockcard h2-flow__node h2-flow__node--first">
            <p className="h2-mockcard__title">{text.newOrder}</p>
            <div className="h2-mockrow">
              <span className="h2-mockrow__main">
                {text.giftBoxes}
                <small>{text.giftNote}</small>
              </span>
              <span className="h2-chip h2-chip--plain">{text.new}</span>
            </div>
          </div>
          <span className="h2-flow__link" aria-hidden />
          <div className="h2-mockcard h2-flow__node">
            <p className="h2-mockcard__title">{text.checks}</p>
            <div className="h2-mockrow">
              <span className="h2-mockrow__main">{text.stock}</span>
              <span className="h2-chip h2-chip--green">{text.pass}</span>
            </div>
            <div className="h2-mockrow">
              <span className="h2-mockrow__main">{text.pickup}</span>
              <span className="h2-chip h2-chip--green">{text.pass}</span>
            </div>
            <div className="h2-mockrow">
              <span className="h2-mockrow__main">{text.discount}</span>
              <span className="h2-chip h2-chip--amber">{text.ownerApproval}</span>
            </div>
          </div>
          <span className="h2-flow__link" aria-hidden />
          <div className="h2-mockcard h2-flow__node h2-flow__node--last">
            <p className="h2-mockcard__title">{text.actions}</p>
            <div className="h2-mockrow">
              <span className="h2-mockrow__main">
                {text.planned}
                <small>{text.plannedNote}</small>
              </span>
              <span className="h2-chip h2-chip--green">{text.plannedChip}</span>
            </div>
            <div className="h2-mockrow">
              <span className="h2-mockrow__main">{text.email}</span>
              <span className="h2-chip h2-chip--green">{text.sent}</span>
            </div>
            <div className="h2-mockrow">
              <span className="h2-mockrow__main">{text.receipt}</span>
              <span className="h2-chip h2-chip--plain">{text.auto}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function H2Cases({ drawing }: { drawing?: React.ReactNode } = {}): React.JSX.Element {
  const text = useSiteCopy().cases;
  return (
    <>
      <BannerSection
        id="h2-cases-title"
        swatch="sky"
        layers={{
          kind: 'single',
          foreground: { paint: { finish: 'dry', stroke: 3 }, angle: -1, offset: 0 },
        }}
        mirrored={false}
        anchor="workflows"
        field="mauve-ember"
        drawing={drawing}
        title={text.title}
        sub={text.sub}
      />
      <section className="h2-section h2-section--band h2-rule" aria-labelledby="h2-cases-title">
        <div className="h2-shell">
          <H2WorkflowCanvas />
          <UseCaseCards cases={withText(useCaseLayouts, text.items)} />
        </div>
      </section>
    </>
  );
}

/* ---------- Satyr Kitchen (production inside the suite) ---------- */

const productionLayouts: Record<keyof SiteCopy['production']['items'], CaseLayout> = {
  workflow: { field: 'apricot-beam', cover: 'cover-workflow' },
  timeline: { field: 'slate-amber', cover: 'cover-timeline' },
  floor: { field: 'copper-mist', cover: 'cover-floor' },
};

export function H2Production({ drawing }: { drawing?: React.ReactNode } = {}): React.JSX.Element {
  const text = useSiteCopy().production;
  return (
    <>
      <BannerSection
        id="h2-production-title"
        swatch="gold"
        layers={{
          kind: 'single',
          foreground: { paint: { finish: 'wet', stroke: 3 }, angle: 1, offset: 0 },
        }}
        mirrored={true}
        anchor="kitchen"
        field="apricot-beam"
        drawing={drawing}
        title={text.title}
        sub={text.sub}
      />
      <section
        className="h2-section h2-section--band h2-rule"
        aria-labelledby="h2-production-title"
      >
        <div className="h2-shell">
          <UseCaseCards cases={withText(productionLayouts, text.items)} />
        </div>
      </section>
    </>
  );
}

/* ---------- Seams Wallet (the other product, one band) ---------- */

export function H2WalletBand({ drawing }: { drawing?: React.ReactNode } = {}): React.JSX.Element {
  const { linkProps } = useSiteRouter();
  const walletProps = linkProps('/wallet');
  const copy = useSiteCopy();

  return (
    <BannerSection
      id="h2-wallet-title"
      swatch="lavender"
      layers={{
        kind: 'single',
        foreground: { paint: { finish: 'wet', stroke: 2 }, angle: -1, offset: 0 },
      }}
      mirrored={true}
      field="teal-peach"
      drawing={drawing}
      title={copy.walletBand.title}
      sub={copy.walletBand.sub}
    >
      <a className="h2-btn h2-btn--primary" href={walletProps.href} onClick={walletProps.onClick}>
        {copy.common.exploreWallet}
        <ArrowRightAnim size={12} />
      </a>
    </BannerSection>
  );
}

/* ---------- two products: the shop and the kitchen ---------- */

export function H2Duo(): React.JSX.Element {
  const { linkProps } = useSiteRouter();
  const satyrProps = linkProps('/ecommerce');
  const bakeryProps = linkProps('/ecommerce#kitchen');
  const copy = useSiteCopy();

  return (
    <section className="h2-section h2-section--snug h2-rule" aria-labelledby="h2-duo-title">
      <div className="h2-shell">
        <div className="h2-duo__head">
          <h2 id="h2-duo-title" className="h2-display">
            {copy.duo.title}
          </h2>
          <p className="h2-duo__copy">{copy.duo.copy}</p>
        </div>
        <div className="h2-duo__grid">
          <a className="h2-duo__panel" href={satyrProps.href} onClick={satyrProps.onClick}>
            <h3 className="h2-duo__title">
              <InkTile sign="shop" />
              Purin Pantry
            </h3>
            <p className="h2-duo__panel-copy">{copy.duo.satyr}</p>
            <div className="h2-duo__visual">
              <ShopTile />
            </div>
            <span className="h2-duo__cta">
              {copy.common.exploreSatyr}
              <ArrowRightAnim size={12} />
            </span>
          </a>
          <a className="h2-duo__panel" href={bakeryProps.href} onClick={bakeryProps.onClick}>
            <h3 className="h2-duo__title">
              <InkTile sign="croissant" />
              Kitchen
            </h3>
            <p className="h2-duo__panel-copy">{copy.duo.kitchen}</p>
            <div className="h2-duo__visual">
              <KitchenTile />
            </div>
            <span className="h2-duo__cta">
              {copy.common.exploreKitchen}
              <ArrowRightAnim size={12} />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */

type FaqItem = {
  q: string;
  a: string;
  more?: { label: string; to: string };
};

/* one footer column: a grey heading over its questions */
type FaqGroup = {
  heading: string;
  items: readonly FaqItem[];
};

type FaqKey = keyof SiteCopy['faq']['items'];

/* where each answer's link leads; an answer with no entry has no link */
const faqLinks: Partial<Record<FaqKey, string>> = {
  whatIsSatyr: '/ecommerce',
  agents: '/ecommerce#workflows',
  control: '/ecommerce#control',
  tools: '/#integrations',
  start: CONTACT_LINK_TARGET,
};

type GroupKey = keyof SiteCopy['faq']['groups'];

const footerFaqs = {
  home: [
    ['product', ['whatIsSatyr', 'agents']],
    ['control', ['control', 'secrets']],
    ['start', ['start', 'models']],
  ],
  ecommerce: [
    ['agents', ['agents', 'tools']],
    ['control', ['control', 'secrets']],
    ['start', ['start', 'models']],
  ],
} satisfies Record<string, readonly (readonly [GroupKey, readonly FaqKey[]])[]>;

function faqGroups(audience: FooterFaqAudience, faq: SiteCopy['faq']): FaqGroup[] {
  return footerFaqs[audience].map(([group, keys]) => ({
    heading: faq.groups[group],
    items: keys.map((key) => {
      const { q, a, more } = faq.items[key];
      const to = faqLinks[key];
      return to ? { q, a, more: { label: more, to } } : { q, a };
    }),
  }));
}

type FooterFaqAudience = keyof typeof footerFaqs;

type FaqPopFrame = { left: number; top: number; w: number; h: number };

/* The footer FAQ, set like the link columns under it: a grey heading over
   each column, and each question a row with a chevron. Every answer opens
   below its question in one shared popover that moves and resizes between
   questions, as the navbar menus do. A hover opens the card and the
   pointer can move into it to reach its link; a click pins it open. */
function H2FooterFaq({
  title,
  groups,
}: {
  title: string;
  groups: readonly FaqGroup[];
}): React.JSX.Element {
  const CLOSE_DELAY_MS = 120;
  /* the card's inner padding, so the answer text lines up with the question */
  const POP_INSET_PX = 20;

  const { linkProps } = useSiteRouter();
  const baseId = React.useId();
  const entries = React.useMemo(
    () => groups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.heading }))),
    [groups],
  );
  const rootRef = React.useRef<HTMLElement | null>(null);
  const triggerRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const paneRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const closeTimerRef = React.useRef<number | null>(null);
  const prevOpenRef = React.useRef<number | null>(null);
  const lastPointerRef = React.useRef<string>('mouse');
  const [open, setOpen] = React.useState<number | null>(null);
  const [pinned, setPinned] = React.useState<boolean>(false);
  const [frame, setFrame] = React.useState<FaqPopFrame | null>(null);
  // Move and resize only between questions; a first open snaps into place.
  const [morph, setMorph] = React.useState<boolean>(false);
  const [layoutTick, setLayoutTick] = React.useState<number>(0);

  const cancelClose = React.useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = React.useCallback(() => {
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(null);
      setPinned(false);
      closeTimerRef.current = null;
    }, CLOSE_DELAY_MS);
  }, [cancelClose]);

  React.useEffect(() => cancelClose, [cancelClose]);

  React.useLayoutEffect(() => {
    const previous = prevOpenRef.current;
    prevOpenRef.current = open;
    // Keep the last frame while closing so the card fades out in place.
    if (open === null) {
      setMorph(false);
      return;
    }
    const root = rootRef.current;
    const trigger = triggerRefs.current[open];
    const pane = paneRefs.current[open];
    if (!root || !trigger || !pane) return;
    const rootRect = root.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const w = pane.offsetWidth;
    const h = pane.offsetHeight;
    const left = Math.max(
      -POP_INSET_PX,
      Math.min(triggerRect.left - rootRect.left - POP_INSET_PX, rootRect.width - w + POP_INSET_PX),
    );
    // No gap: the card's padded top bridges the question to the card, so the
    // pointer never crosses the question below on its way in.
    const top = triggerRect.bottom - rootRect.top;
    setMorph(previous !== null && previous !== open);
    setFrame({ left, top, w, h });
  }, [open, layoutTick]);

  React.useEffect(() => {
    if (open === null) return;
    const onResize = () => setLayoutTick((tick) => tick + 1);
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && rootRef.current?.contains(event.target)) return;
      setOpen(null);
      setPinned(false);
    };
    window.addEventListener('resize', onResize);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const closeOnLeave = (event: React.PointerEvent) => {
    if (event.pointerType !== 'mouse' || pinned) return;
    scheduleClose();
  };

  const close = () => {
    setOpen(null);
    setPinned(false);
  };

  let entryIndex = 0;

  return (
    <section
      ref={rootRef}
      className="h2-footer__faq"
      aria-labelledby={`${baseId}-title`}
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || open === null) return;
        triggerRefs.current[open]?.focus();
        close();
      }}
      onBlurCapture={(event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && rootRef.current?.contains(next)) return;
        close();
      }}
    >
      <h2 id={`${baseId}-title`} className="h2-footer__faq-title">
        {title}
      </h2>

      <div className="h2-footer__links">
        {groups.map((group) => (
          <div className="h2-footer__col" key={group.heading}>
            <h3>{group.heading}</h3>
            {group.items.map((item) => {
              const index = entryIndex++;
              return (
                <button
                  key={item.q}
                  ref={(el) => {
                    triggerRefs.current[index] = el;
                  }}
                  type="button"
                  id={`${baseId}-q-${index}`}
                  className={`h2-footer__faq-q${open === index ? ' is-open' : ''}`}
                  aria-expanded={open === index}
                  aria-controls={`${baseId}-a-${index}`}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== 'mouse') return;
                    cancelClose();
                    // a pinned card stays put while the pointer travels to it
                    if (pinned && open === index) return;
                    setPinned(false);
                    setOpen(index);
                  }}
                  onPointerLeave={closeOnLeave}
                  onPointerDown={(event) => {
                    lastPointerRef.current = event.pointerType;
                  }}
                  onClick={(event) => {
                    cancelClose();
                    // A mouse click pins the hover preview; a second click,
                    // like a keyboard or touch press, toggles it closed.
                    const isMouse = lastPointerRef.current === 'mouse' && event.detail > 0;
                    if (open === index && (pinned || !isMouse)) {
                      close();
                      return;
                    }
                    setOpen(index);
                    setPinned(true);
                  }}
                >
                  <span>{item.q}</span>
                  <ChevronDown size={14} strokeWidth={1.75} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div
        className={`h2-faq-pop${open !== null ? ' is-open' : ''}${morph ? ' is-morphing' : ''}`}
        style={frame ? { left: frame.left, top: frame.top } : undefined}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') cancelClose();
        }}
        onPointerLeave={closeOnLeave}
      >
        <div className="h2-faq-pop__card">
          <div
            className="h2-faq-pop__shell"
            style={frame ? { width: frame.w, height: frame.h } : undefined}
          >
            {entries.map((item, index) => {
              const state =
                open === index
                  ? 'is-active'
                  : open !== null && index < open
                    ? 'is-before'
                    : 'is-after';
              const moreProps = item.more ? linkProps(item.more.to) : null;
              return (
                <div
                  key={`${item.group}-${item.q}`}
                  ref={(el) => {
                    paneRefs.current[index] = el;
                  }}
                  id={`${baseId}-a-${index}`}
                  role="region"
                  aria-labelledby={`${baseId}-q-${index}`}
                  className={`h2-faq-pop__pane ${state}`}
                >
                  <p className="h2-faq-pop__heading">{item.group}</p>
                  <p className="h2-faq-pop__answer">{item.a}</p>
                  {item.more && moreProps ? (
                    <a
                      className="h2-faq-pop__more"
                      href={moreProps.href}
                      onClick={moreProps.onClick}
                      tabIndex={open === index ? 0 : -1}
                    >
                      {item.more.label}
                      <ArrowRightAnim size={10} />
                    </a>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */

type H2FooterLink = {
  label: string;
  to: string;
  external?: boolean;
};

function getFooterGroups(t: Translate): { heading: string; links: H2FooterLink[] }[] {
  return [
    {
      heading: t('products'),
      links: [
        { label: 'Purin Pantry', to: '/ecommerce' },
        { label: 'Kitchen', to: '/ecommerce#kitchen' },
        { label: 'Seams Wallet', to: '/wallet' },
      ],
    },
    {
      heading: 'Purin Pantry',
      links: [
        { label: t('theSuite'), to: '/ecommerce#suite' },
        { label: t('agentWorkflows'), to: '/ecommerce#workflows' },
        { label: t('approvalsReceipts'), to: '/ecommerce#control' },
        { label: t('integrations'), to: '/#integrations' },
      ],
    },
    {
      heading: 'Seams Wallet',
      links: [
        { label: t('custodyModel'), to: '/docs/concepts/custody/' },
        { label: t('passkeys'), to: '/docs/concepts/auth-methods/passkeys' },
        { label: t('walletsSignatures'), to: '/docs/concepts/threshold-signing/' },
        { label: t('permissionsPolicy'), to: '/docs/concepts/policy/mandates' },
      ],
    },
    {
      heading: t('developers'),
      links: [
        { label: t('documentation'), to: '/docs/concepts/' },
        { label: t('architecture'), to: '/docs/concepts/architecture' },
        { label: t('guides'), to: '/docs/guides/' },
      ],
    },
    {
      heading: t('socials'),
      links: [
        { label: 'X', to: 'https://x.com/lowerarchy', external: true },
        { label: 'GitHub', to: 'https://github.com/seams-tech', external: true },
      ],
    },
    {
      heading: t('company'),
      links: [
        { label: t('about'), to: '/company/' },
        { label: t('blog'), to: '/company/#blog' },
        { label: t('brand'), to: '/branding/' },
        { label: t('contact'), to: CONTACT_LINK_TARGET },
      ],
    },
  ];
}

/* ---------- closing call to action: the shared banner ---------- */

const ctaLayout = {
  home: { field: 'azure-coral', to: '/ecommerce' },
  ecommerce: { field: 'mauve-ember', to: '/#integrations' },
} satisfies Record<keyof SiteCopy['cta'], { field: GrainFieldName; to: string }>;

export function H2Cta({
  audience,
  drawing,
}: {
  audience: keyof typeof ctaLayout;
  drawing?: React.ReactNode;
}): React.JSX.Element {
  const { linkProps } = useSiteRouter();
  const layout = ctaLayout[audience];
  const copy = useSiteCopy().cta[audience];
  const secondaryProps = linkProps(layout.to);

  return (
    <BannerSection
      id="h2-cta-title"
      swatch="peach"
      layers={{
        kind: 'double',
        background: { paint: { finish: 'wet', stroke: 3 }, angle: 2, offset: -28 },
        foreground: { paint: { finish: 'dry', stroke: 4 }, angle: -1, offset: 0 },
      }}
      mirrored={false}
      field={layout.field}
      drawing={drawing}
      title={copy.title}
      sub={copy.sub}
    >
      <a
        className="h2-btn h2-btn--primary"
        href={secondaryProps.href}
        onClick={secondaryProps.onClick}
      >
        {copy.secondary}
        <ArrowRightAnim size={12} />
      </a>
    </BannerSection>
  );
}

export function H2Footer({ faq }: { faq?: FooterFaqAudience } = {}): React.JSX.Element {
  const t = useTranslation();
  const copy = useSiteCopy();
  const footerGroups = getFooterGroups(t);
  const { linkProps } = useSiteRouter();
  const homeProps = linkProps('/');

  return (
    <footer className="h2-footer h2-rule" aria-label={t('siteFooter')}>
      <div className="h2-footer__inner">
        <div className="h2-footer__brand">
          <a href={homeProps.href} onClick={homeProps.onClick} aria-label={t('purinHome')}>
            <PurinWordmark height={32} />
          </a>
          <LanguageSelector placement="footer" />
        </div>

        {faq ? <H2FooterFaq title={copy.faq.title} groups={faqGroups(faq, copy.faq)} /> : null}

        <nav className="h2-footer__main h2-footer__links" aria-label={t('footerNavigation')}>
          {footerGroups.map((group) => (
            <div className="h2-footer__col" key={group.heading}>
              <h3>{group.heading}</h3>
              {group.links.map((link) => {
                const props = linkProps(link.to);
                return (
                  <a
                    key={link.label}
                    href={props.href}
                    onClick={props.onClick}
                    {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
