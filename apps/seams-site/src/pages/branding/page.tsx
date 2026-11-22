import React from 'react';
import { useTranslation } from '@/i18n/browser';
import type { MessageKey } from '@/i18n/catalog';
import NavbarCompact from '@/components/Navbar/NavbarCompact';
import PurinWordmark from '@/components/icons/PurinWordmark';
import { H2Footer } from '@/components/h2/sections';
import { PURIN_BRAND_ASSETS } from '@/context/purinBranding';
import '@/styles/h2.css';
import './styles.css';

/* The brand page: the Purin cat mark, its three forms, its colours and its motion.
   Pantry traces and builds the files: `docs/brand/purin-logo` in purin-labs/pantry. */

type Colour = { name: MessageKey; use: MessageKey; value: string; onDark: boolean };

/* the four flat colours of the mark */
const COLOURS: readonly Colour[] = [
  { name: 'brandingColourCat', use: 'brandingColourCatUse', value: '#301D17', onDark: true },
  {
    name: 'brandingColourCustard',
    use: 'brandingColourCustardUse',
    value: '#F0B141',
    onDark: false,
  },
  {
    name: 'brandingColourCaramel',
    use: 'brandingColourCaramelUse',
    value: '#B54D1F',
    onDark: true,
  },
  { name: 'brandingColourCream', use: 'brandingColourCreamUse', value: '#FBF0DC', onDark: false },
];

/* the front page concept: its own entry in the build, in English only */
const FRONT_PAGE_CONCEPT = '/branding/front-page/';

const MOTION: readonly MessageKey[] = [
  'brandingMotionSway',
  'brandingMotionJiggle',
  'brandingMotionEars',
  'brandingMotionStill',
];

export function BrandingPage(): React.JSX.Element {
  const t = useTranslation();
  return (
    <div className="h2-page">
      <NavbarCompact appearance="light" />
      <div className="h2-col">
        <main aria-labelledby="branding-title">
          <header className="h2-hero-simple branding-hero">
            <div className="h2-shell">
              <h1 id="branding-title" className="h2-display h2-hero-simple__title">
                {t('brandingTitle')}
              </h1>
              <p className="h2-hero-simple__sub">{t('brandingSub')}</p>
            </div>
          </header>

          <section
            className="h2-section h2-section--compact h2-rule"
            aria-labelledby="branding-motion-title"
          >
            <div className="h2-shell branding-split">
              {/* the file carries its motion, and it stops with the less-motion setting */}
              <div className="branding-stage">
                <img
                  src={PURIN_BRAND_ASSETS.markAnimated}
                  alt={t('brandingMarkAlt')}
                  width={360}
                  height={360}
                />
              </div>
              <div>
                <h2 id="branding-motion-title" className="h2-display branding-split__title">
                  {t('brandingMotionTitle')}
                </h2>
                <ul className="branding-list">
                  {MOTION.map((key) => (
                    <li key={key}>{t(key)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section
            className="h2-section h2-section--compact h2-rule"
            aria-labelledby="branding-forms-title"
          >
            <div className="h2-shell">
              <h2 id="branding-forms-title" className="h2-display branding-split__title">
                {t('brandingFormsTitle')}
              </h2>
              <ul className="branding-forms">
                <li>
                  <div className="branding-form branding-form--paper">
                    <img src={PURIN_BRAND_ASSETS.mark} alt="" width={168} height={168} />
                  </div>
                  <h3>{t('brandingMark')}</h3>
                  <p>{t('brandingMarkCopy')}</p>
                </li>
                <li>
                  <div className="branding-form branding-form--dark">
                    <img src={PURIN_BRAND_ASSETS.icon} alt="" width={132} height={132} />
                  </div>
                  <h3>{t('brandingIcon')}</h3>
                  <p>{t('brandingIconCopy')}</p>
                </li>
                <li>
                  <div className="branding-form branding-form--paper">
                    <PurinWordmark height={64} />
                  </div>
                  <h3>{t('brandingWordmark')}</h3>
                  <p>{t('brandingWordmarkCopy')}</p>
                </li>
              </ul>
            </div>
          </section>

          <section
            className="h2-section h2-section--compact h2-rule"
            aria-labelledby="branding-colours-title"
          >
            <div className="h2-shell">
              <h2 id="branding-colours-title" className="h2-display branding-split__title">
                {t('brandingColoursTitle')}
              </h2>
              <ul className="branding-colours">
                {COLOURS.map((colour) => (
                  <li key={colour.value}>
                    <div
                      className={`branding-colour${colour.onDark ? ' branding-colour--dark' : ''}`}
                      style={{ background: colour.value }}
                    >
                      <code>{colour.value}</code>
                    </div>
                    <h3>{t(colour.name)}</h3>
                    <p>{t(colour.use)}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section
            className="h2-section h2-section--compact h2-rule"
            aria-labelledby="branding-concept-title"
          >
            <div className="h2-shell branding-concept">
              <h2 id="branding-concept-title" className="h2-display branding-split__title">
                {t('brandingConceptTitle')}
              </h2>
              <p>{t('brandingConceptCopy')}</p>
              {/* a separate page, outside the site router: a plain link loads it */}
              <a className="h2-btn h2-btn--primary" href={FRONT_PAGE_CONCEPT}>
                {t('brandingConceptLink')}
              </a>
            </div>
          </section>
        </main>
        <H2Footer />
      </div>
    </div>
  );
}

export default BrandingPage;
