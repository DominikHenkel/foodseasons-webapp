import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaChevronUp } from 'react-icons/fa';
import { Head } from 'vite-react-ssg';
import foodData from '../data/export.json';
import DetailPage from './DetailPage';
import {
  getLocalizedItemName,
  getTranslator,
  translations,
} from './i18n';

const sortOrderMap = {
  season: 0,
  stock: 1,
  import: 2,
};

const regionOptions = [
  { id: 'germany', labelKey: 'regions.germany', shortLabel: 'DEU' },
  { id: 'usWest', labelKey: 'regions.usWest', shortLabel: 'USA (W)' },
  { id: 'usMidwest', labelKey: 'regions.usMidwest', shortLabel: 'USA (M)' },
  { id: 'usSouth', labelKey: 'regions.usSouth', shortLabel: 'USA (S)' },
  { id: 'usNortheast', labelKey: 'regions.usNortheast', shortLabel: 'USA (NE)' },
];

const temperatureOptions = [
  { id: 'fahrenheit', labelKey: 'temperatureUnits.fahrenheit', shortLabel: '°F' },
  { id: 'celsius', labelKey: 'temperatureUnits.celsius', shortLabel: '°C' },
];

const seasonFieldMap = {
  germany: 'seasons',
  usWest: 'seasons_US_West',
  usMidwest: 'seasons_US_MidWest',
  usSouth: 'seasons_US_South',
  usNortheast: 'seasons_US_NorthEast',
};

const siteUrl = 'https://inseason-foods.com';
const freeFoodItems = foodData.filter((item) => item.free);

function getLocaleFromPath(pathname) {
  return pathname.startsWith('/en') ? 'en' : 'de';
}

function getLocalizedRootPath(locale) {
  return locale === 'en' ? '/en/' : '/';
}

function getLocalizedItemPath(slug, locale) {
  return locale === 'en' ? `/en/item/${slug}/` : `/item/${slug}/`;
}

function getPageMetadata(item, locale, t) {
  if (item) {
    const itemName = getLocalizedItemName(item, locale);
    return {
      title:
        locale === 'de'
          ? `${itemName} – Saison, Lagerung & Tipps | Saisonkalender`
          : `${itemName} – Season, Storage & Tips | In Season`,
      description:
        locale === 'de'
          ? `${itemName} (${item.latName}) im Saisonkalender: Erfahre, wann ${itemName} Saison hat, wie du ${itemName} lagerst und welche Tipps für Frische und Haltbarkeit wichtig sind.`
          : `${itemName} (${item.latName}) in the seasonal calendar: learn when ${itemName} is in season, how to store it, and which tips help with freshness and shelf life.`,
      path: getLocalizedItemPath(item.image, locale),
      image: `${siteUrl}/data/images/${item.image.toLowerCase()}.jpg`,
    };
  }

  return {
    title:
      locale === 'de'
        ? 'Saisonkalender Obst & Gemüse – Was hat gerade Saison?'
        : 'In Season – Seasonal Fruit & Vegetable Calendar',
    description: t('seo.metaDescription'),
    path: getLocalizedRootPath(locale),
    image: `${siteUrl}/og-image.jpg`,
  };
}

function SeoHead({ item, locale, t }) {
  const meta = getPageMetadata(item, locale, t);
  const canonicalUrl = `${siteUrl}${meta.path}`;
  const alternateDeUrl = `${siteUrl}${item ? getLocalizedItemPath(item.image, 'de') : '/'}`;
  const alternateEnUrl = `${siteUrl}${item ? getLocalizedItemPath(item.image, 'en') : '/en/'}`;
  const itemName = item ? getLocalizedItemName(item, locale) : null;
  const structuredData = item
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: meta.title,
        description: meta.description,
        url: canonicalUrl,
        inLanguage: locale,
        about: {
          '@type': 'Thing',
          name: itemName,
          alternateName: item.latName,
          category: t(`foodTypes.${item.foodType}`),
        },
      }
    : {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            name: locale === 'de' ? 'Saisonkalender Obst & Gemüse' : 'In Season',
            url: siteUrl,
            inLanguage: locale,
          },
          {
            '@type': 'CollectionPage',
            name: meta.title,
            description: meta.description,
            url: canonicalUrl,
            inLanguage: locale,
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: freeFoodItems.map((food, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: getLocalizedItemName(food, locale),
                url: `${siteUrl}${getLocalizedItemPath(food.image, locale)}`,
              })),
            },
          },
        ],
      };

  return (
    <Head>
      <html lang={locale} />
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="de" href={alternateDeUrl} />
      <link rel="alternate" hrefLang="en" href={alternateEnUrl} />
      <link rel="alternate" hrefLang="x-default" href={alternateDeUrl} />
      <meta property="og:type" content={item ? 'article' : 'website'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:locale" content={locale === 'de' ? 'de_DE' : 'en_US'} />
      <meta property="og:site_name" content={locale === 'de' ? 'Saisonkalender Obst & Gemüse' : 'In Season'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Head>
  );
}

function HomeIntro({ t }) {
  return (
    <section className="seo-intro" aria-label={t('seo.homeHeading')}>
      <p className="seo-kicker">{t('seo.homeLabel')}</p>
      <h1 className="seo-title">{t('seo.homeHeading')}</h1>
      <p className="seo-description">{t('seo.homeIntro')}</p>
    </section>
  );
}

function collapseSeasonGroups(seasons) {
  const normalizedSeasons = Array.isArray(seasons) && seasons.length > 0 ? seasons : Array(12).fill('import');

  return normalizedSeasons.reduce((groups, season) => {
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.season === season) {
      lastGroup.length += 1;
      return groups;
    }

    groups.push({ season, length: 1 });
    return groups;
  }, []);
}

function getSeasonValues(item, regionId) {
  const seasonField = seasonFieldMap[regionId] ?? seasonFieldMap.germany;
  return item[seasonField] ?? item.seasons ?? [];
}

function getSortPriority(item, monthIndex, regionId) {
  const season = getSeasonValues(item, regionId)?.[monthIndex] ?? 'import';
  return sortOrderMap[season] ?? 3;
}

function isYearRoundImport(item, regionId) {
  return getSeasonValues(item, regionId)?.every((season) => season === 'import');
}

function App() {
  const currentMonthIndex = new Date().getMonth();
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();
  const locale = useMemo(() => getLocaleFromPath(location.pathname), [location.pathname]);
  const t = useMemo(() => getTranslator(locale), [locale]);
  const monthOptions = translations[locale].months;
  const monthNames = translations[locale].monthNames;
  const filterOptions = useMemo(
    () => [
      { id: 'none', label: t('filters.none'), icon: FunnelOffIcon },
      { id: 'fruit', label: t('filters.fruit'), icon: AppleIcon },
      { id: 'vegetable', label: t('filters.vegetable'), icon: CarrotIcon },
    ],
    [t]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilterId, setSelectedFilterId] = useState('none');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(currentMonthIndex);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState(
    () => (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('preferredRegion') : null) ?? 'germany'
  );
  const [selectedTemperatureUnit, setSelectedTemperatureUnit] = useState(
    () => (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('preferredTemp') : null) ?? 'celsius'
  );

  // Derive selected item from URL slug
  const selectedItem = useMemo(
    () => (slug ? (foodData.find((item) => item.image === slug) ?? null) : null),
    [slug]
  );
  const dropdownRef = useRef(null);
  const floatingControlsRef = useRef(null);
  const selectedFilter = filterOptions.find((option) => option.id === selectedFilterId) ?? filterOptions[0];
  const selectedMonth = monthOptions[selectedMonthIndex];
  const selectedMonthName = monthNames[selectedMonthIndex] ?? selectedMonth;
  const monthIndex = selectedMonthIndex;
  const selectedRegion = regionOptions.find((option) => option.id === selectedRegionId) ?? regionOptions[0];
  const selectedTemperature = temperatureOptions.find((option) => option.id === selectedTemperatureUnit) ?? temperatureOptions[0];

  const filteredAndSortedItems = useMemo(() => {
    let items = [...foodData];

    // Filter nach Lebensmitteltyp
    if (selectedFilterId === 'fruit') {
      items = items.filter((item) => item.foodType === 'fruit');
    } else if (selectedFilterId === 'vegetable') {
      items = items.filter((item) => item.foodType === 'vegetable');
    }

    // Filter nach Suchquery
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => 
        getLocalizedItemName(item, locale).toLowerCase().includes(query) || 
        item.latName.toLowerCase().includes(query)
      );
    }

    // Sortieren nach Verfügbarkeit im ausgewählten Monat
    items.sort((a, b) => {
      const priorityA = getSortPriority(a, monthIndex, selectedRegionId);
      const priorityB = getSortPriority(b, monthIndex, selectedRegionId);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      return getLocalizedItemName(a, locale).localeCompare(getLocalizedItemName(b, locale), locale);
    });

    return items;
  }, [selectedFilterId, monthIndex, searchQuery, locale, selectedRegionId]);

  const groupedItems = useMemo(() => {
    const regularSections = {};
    const importSection = [];
    const lockedItems = [];

    filteredAndSortedItems.forEach((item) => {
      if (!item.free) {
        lockedItems.push(item);
        return;
      }

      if (isYearRoundImport(item, selectedRegionId)) {
        importSection.push(item);
        return;
      }

      const season = getSeasonValues(item, selectedRegionId)?.[monthIndex] ?? 'import';
      const key =
        season === 'season'
          ? t('sections.season')
          : season === 'stock'
            ? t('sections.stock')
            : t('sections.lowAvailability');

      if (!regularSections[key]) {
        regularSections[key] = [];
      }

      regularSections[key].push(item);
    });

    Object.values(regularSections).forEach((items) => {
      items.sort((a, b) => getLocalizedItemName(a, locale).localeCompare(getLocalizedItemName(b, locale), locale));
    });

    importSection.sort((a, b) => getLocalizedItemName(a, locale).localeCompare(getLocalizedItemName(b, locale), locale));
    lockedItems.sort((a, b) => getLocalizedItemName(a, locale).localeCompare(getLocalizedItemName(b, locale), locale));

    const sections = Object.entries(regularSections).map(([title, items]) => ({
      title,
      items,
      lockedItems: [],
    }));

    if (importSection.length > 0 || lockedItems.length > 0) {
      sections.push({
        title: t('sections.import'),
        items: importSection,
        lockedItems,
      });
    }

    return sections;
  }, [filteredAndSortedItems, monthIndex, t, locale, selectedRegionId]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Persist preferences across navigation
  useEffect(() => {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('preferredRegion', selectedRegionId);
  }, [selectedRegionId]);

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('preferredTemp', selectedTemperatureUnit);
  }, [selectedTemperatureUnit]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  if (selectedItem) {
    return (
      <>
        <SeoHead item={selectedItem} locale={locale} t={t} />
        <main className="page-shell">
          <AppBanner t={t} />
          <DetailPage
            item={selectedItem}
            locale={locale}
            t={t}
            temperatureUnit={selectedTemperatureUnit}
            onBack={() => navigate(getLocalizedRootPath(locale))}
            onFavoriteClick={() => setShowDownloadModal(true)}
          />
          <FooterBar
            t={t}
            onDownloadClick={() => setShowDownloadModal(true)}
            onPrivacyClick={() => setShowPrivacyModal(true)}
            onTermsClick={() => setShowTermsModal(true)}
          />
          {showDownloadModal && (
            <DownloadModal locale={locale} t={t} onClose={() => setShowDownloadModal(false)} />
          )}
          {showPrivacyModal && (
            <PrivacyModal t={t} onClose={() => setShowPrivacyModal(false)} />
          )}
          {showTermsModal && (
            <TermsModal t={t} onClose={() => setShowTermsModal(false)} />
          )}
        </main>
        <FloatingPreferenceControls
          t={t}
          controlsRef={floatingControlsRef}
          selectedRegion={selectedRegion}
          selectedTemperature={selectedTemperature}
          onRegionChange={setSelectedRegionId}
          onTemperatureChange={setSelectedTemperatureUnit}
        />
      </>
    );
  }

  return (
    <>
      <SeoHead locale={locale} t={t} />
      <main className="page-shell">
        <AppBanner t={t} />
        <div className="bg-shape bg-shape-left" />
        <div className="bg-shape bg-shape-right" />

        <section className="calendar-card">
        <header className="topbar">
          <div className="brand-group">
            <div className="brand-mark">
              <img className="logo" src="/data/icon.png" alt={t('appLogoAlt')} />
            </div>
            <div className="brand-copy">
              <span className="brand-copy-title">{t('brandTitle')}</span>
              <span className="brand-copy-subtitle">{t('brandSubtitle')}</span>
            </div>
          </div>

          <div className="topbar-main">
            <h2 className="month-title">
              <span className="month-title-short">{selectedMonth}</span>
              <span className="month-title-long">{selectedMonthName}</span>
            </h2>

            <div className="search-area">
              <input
                type="text"
                className="search-input"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={t('searchAriaLabel')}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label={t('clearSearch')}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="filter-area" ref={dropdownRef}>
              {selectedFilter.id !== 'none' && (
                <div className="active-filter-chip" aria-live="polite">
                  <span>{selectedFilter.label}</span>
                  <button
                    type="button"
                    className="active-filter-reset"
                    aria-label={t('resetFilter')}
                    onClick={() => setSelectedFilterId('none')}
                  >
                    ✕
                  </button>
                </div>
              )}

              <button
                type="button"
                className="filter-button"
                aria-label={t('openFilter')}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((prev) => !prev)}
              >
                <FilterIcon />
              </button>

              {isOpen && (
                <ul className="filter-dropdown" role="listbox" aria-label={t('filterOptions')}>
                  {filterOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedFilter.id === option.id;

                    return (
                      <li key={option.id}>
                        <button
                          type="button"
                          className={`dropdown-option ${isSelected ? 'selected' : ''}`}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setSelectedFilterId(option.id);
                            setIsOpen(false);
                          }}
                        >
                          <Icon />
                          <span>{option.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </header>

        <HomeIntro t={t} />

        <section className="month-selection" aria-label={t('monthSelection')}>
          {monthOptions.map((month, index) => {
            const isSelected = selectedMonthIndex === index;

            return (
              <button
                key={month}
                type="button"
                className={`month-button ${isSelected ? 'selected' : ''}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedMonthIndex(index)}
              >
                {month}
              </button>
            );
          })}
        </section>

        <section className="products-list" aria-label={t('productsList')}>
          {groupedItems.length > 0 ? (
            <div>
              {groupedItems.map((section) => (
                <div key={section.title} className="product-section">
                  <h2 className="section-title">{section.title}</h2>
                  <div className="products-grid">
                    {section.items.map((item) => (
                      <ProductCard 
                        key={item.id} 
                        item={item} 
                        locale={locale}
                        monthIndex={monthIndex}
                        t={t}
                        onFavoriteClick={() => setShowDownloadModal(true)}
                        onClick={() => {
                          if (item.free) {
                            navigate(getLocalizedItemPath(item.image, locale));
                          } else {
                            setShowDownloadModal(true);
                          }
                        }}
                      />
                    ))}

                    {section.title === t('sections.import') && section.lockedItems.length > 0 && (
                      <PromoCard locale={locale} t={t} onClick={() => setShowDownloadModal(true)} />
                    )}

                    {section.lockedItems.map((item) => (
                      <ProductCard 
                        key={item.id} 
                        item={item} 
                        locale={locale}
                        monthIndex={monthIndex}
                        t={t}
                        onFavoriteClick={() => setShowDownloadModal(true)}
                        onClick={() => {
                          setShowDownloadModal(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-results">{t('noResults')}</p>
          )}
        </section>

        {showDownloadModal && (
          <DownloadModal locale={locale} t={t} onClose={() => setShowDownloadModal(false)} />
        )}
        {showPrivacyModal && (
          <PrivacyModal t={t} onClose={() => setShowPrivacyModal(false)} />
        )}
      </section>

      <FooterBar
        t={t}
        onDownloadClick={() => setShowDownloadModal(true)}
        onPrivacyClick={() => setShowPrivacyModal(true)}
        onTermsClick={() => setShowTermsModal(true)}
      />
      {showTermsModal && (
        <TermsModal t={t} onClose={() => setShowTermsModal(false)} />
      )}
      <FloatingPreferenceControls
        t={t}
        controlsRef={floatingControlsRef}
        selectedRegion={selectedRegion}
        selectedTemperature={selectedTemperature}
        onRegionChange={setSelectedRegionId}
        onTemperatureChange={setSelectedTemperatureUnit}
      />
        <ScrollToTopButton t={t} />
      </main>
    </>
  );
}

function AppBanner({ t }) {
  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
  const [dismissed, setDismissed] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem('appBannerDismissed') === '1'
  );

  if (!isAndroid || dismissed) return null;

  const storeUrl = 'https://play.google.com/store/apps/details?id=com.app.foodseasons';

  function dismiss() {
    sessionStorage.setItem('appBannerDismissed', '1');
    setDismissed(true);
  }

  return (
    <div className="app-banner">
      <button
        type="button"
        className="app-banner-close"
        onClick={dismiss}
        aria-label={t('appBannerClose')}
      >
        ✕
      </button>
      <img className="app-banner-icon" src="/data/icon.png" alt="" aria-hidden="true" />
      <div className="app-banner-text">
        <span className="app-banner-title">{t('appBannerTitle')}</span>
        <span className="app-banner-subtitle">{t('appBannerSubtitle')}</span>
      </div>
      <a
        href={storeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="app-banner-cta"
      >
        {t('appBannerAction')}
      </a>
    </div>
  );
}

function FloatingPreferenceControls({
  t,
  controlsRef,
  selectedRegion,
  selectedTemperature,
  onRegionChange,
  onTemperatureChange,
}) {
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (controlsRef.current && !controlsRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [controlsRef]);

  const selectors = [
    {
      id: 'region',
      ariaLabel: t('regionSelector'),
      selected: t(selectedRegion.labelKey),
      selectedShort: selectedRegion.shortLabel,
      options: regionOptions,
      onSelect: onRegionChange,
    },
    {
      id: 'temperature',
      ariaLabel: t('temperatureSelector'),
      selected: t(selectedTemperature.labelKey),
      selectedShort: selectedTemperature.shortLabel,
      options: temperatureOptions,
      onSelect: onTemperatureChange,
    },
  ];

  return (
    <div className="floating-preferences" ref={controlsRef} aria-label={t('floatingSelectors')}>
      {selectors.map((selector) => {
        const isOpen = openMenu === selector.id;

        return (
          <div key={selector.id} className="floating-selector">
            <button
              type="button"
              className={`floating-selector-button ${isOpen ? 'open' : ''}`}
              aria-label={selector.ariaLabel}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              title={selector.selected}
              onClick={() => setOpenMenu((current) => (current === selector.id ? null : selector.id))}
            >
              <span className="floating-selector-value">{selector.selectedShort}</span>
            </button>

            {isOpen && (
              <ul className="floating-selector-dropdown" role="listbox" aria-label={selector.ariaLabel}>
                {selector.options.map((option) => {
                  const isSelected = selector.selected === t(option.labelKey);

                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        className={`floating-selector-option ${isSelected ? 'selected' : ''}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          selector.onSelect(option.id);
                          setOpenMenu(null);
                        }}
                      >
                        <span>{t(option.labelKey)}</span>
                        {isSelected && <span className="floating-selector-check">•</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ScrollToTopButton({ t }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 200);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!visible) return null;

  return (
    <button
      type="button"
      className="scroll-to-top"
      onClick={scrollToTop}
      aria-label={t('scrollToTop')}
    >
      <FaChevronUp />
    </button>
  );
}

function FooterBar({ onDownloadClick, onPrivacyClick, onTermsClick, t }) {
  return (
    <footer className="app-footer" aria-label={t('footerAria')}>
      <a href="https://www.jondo-software.de/imprint" className="footer-link">{t('imprint')}</a>
      <button type="button" className="footer-link" onClick={onPrivacyClick}>{t('privacy')}</button>
      <button type="button" className="footer-link" onClick={onTermsClick}>{t('terms')}</button>
      <button type="button" className="footer-link footer-download" onClick={onDownloadClick}>
        {t('downloadApp')}
      </button>
    </footer>
  );
}

function PromoCard({ locale, onClick, t }) {
  const promoImageSrc = locale === 'de' ? '/screenshots/Mock_DE.png' : '/screenshots/Mock_EN.png';

  return (
    <article className="promo-card">
      <div className="promo-image" aria-hidden="true">
        <img className="promo-image-mock" src={promoImageSrc} alt="" loading="lazy" />
      </div>
      <div className="promo-content">
        <h3 className="promo-title">{t('promoTitle')}</h3>
        <p className="promo-text">{t('promoText')}</p>
        <button type="button" className="promo-button" onClick={onClick}>{t('learnMore')}</button>
      </div>
    </article>
  );
}

function FilterIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6H20" />
      <path d="M7 12H17" />
      <path d="M10 18H14" />
    </svg>
  );
}

function FunnelOffIcon() {
  return (
    <svg className="option-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5H20L14 12V18L10 20V12L4 5Z" />
      <path d="M4 20L20 4" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="option-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 8C8.2 8 6 11 6 14.8C6 18.4 8.8 21 12 21C15.2 21 18 18.4 18 14.8C18 11 15.8 8 12 8Z" />
      <path d="M12 8C12 5.8 13.2 4.3 15.4 3.7" />
      <path d="M11.4 6C10 4.6 8.4 4.2 7 4.4" />
    </svg>
  );
}

function CarrotIcon() {
  return (
    <svg className="option-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 8L18 13L10 21L5 16L13 8Z" />
      <path d="M15.5 6.5C17.4 4.6 20 4.6 22 5.8" />
      <path d="M12.5 3.5C14.4 5.4 14.4 8 13.2 10" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="heart-icon" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function DownloadModal({ locale, onClose, t }) {
  const isAndroid = /android/i.test(navigator.userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [slideAnimation, setSlideAnimation] = useState('');

  const carouselImages = locale === 'de'
    ? [
        '/screenshots/AppStore_DE_1.png',
        '/screenshots/AppStore_DE_2.png',
        '/screenshots/AppStore_DE_3.png',
        '/screenshots/AppStore_DE_4.png',
      ]
    : [
        '/screenshots/AppStore_EN_1.png',
        '/screenshots/AppStore_EN_2.png',
        '/screenshots/AppStore_EN_3.png',
        '/screenshots/AppStore_EN_4.png',
      ];

  const androidAppUrl = 'https://play.google.com/store/apps/details?id=com.app.foodseasons';
  const iOSAppUrl = 'https://apps.apple.com/app/apple-store/id1559268992?pt=120770581&ct=Webapp-inseason&mt=8';
  const androidBadgeSrc =
    locale === 'de'
      ? '/download_badges/GetItOnGooglePlay_Badge_Web_color_German.png'
      : '/download_badges/GetItOnGooglePlay_Badge_Web_color_English.png';
  const iOSBadgeSrc = '/download_badges/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg';

  const previousSlide = (activeSlide - 1 + carouselImages.length) % carouselImages.length;
  const nextSlide = (activeSlide + 1) % carouselImages.length;

  function navigateCarousel(direction) {
    setSlideAnimation(direction > 0 ? 'animate-next' : 'animate-prev');
    setActiveSlide((prev) => (prev + direction + carouselImages.length) % carouselImages.length);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeSlide, carouselImages.length]);

  function handleTouchStart(event) {
    setTouchStartX(event.touches[0].clientX);
  }

  function handleTouchEnd(event) {
    if (touchStartX === null) {
      return;
    }

    const touchEndX = event.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    const swipeThreshold = 40;

    if (deltaX > swipeThreshold) {
      navigateCarousel(-1);
    } else if (deltaX < -swipeThreshold) {
      navigateCarousel(1);
    }

    setTouchStartX(null);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label={t('closeModal')}
        >
          ✕
        </button>

        <h2 className="modal-title">{t('downloadModalTitle')}</h2>
        <p className="modal-text">{t('downloadModalText')}</p>

        <div
          className={`modal-carousel ${slideAnimation}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onAnimationEnd={() => setSlideAnimation('')}
          aria-label={t('appScreenshots')}
        >
          <button
            type="button"
            className="modal-slide side"
            onClick={() => navigateCarousel(-1)}
            aria-label={t('previousImage')}
          >
            <img src={carouselImages[previousSlide]} alt={t('appScreenshotAlt')} onError={(e) => { e.currentTarget.src = '/data/icon.png'; }} />
          </button>
          <div className="modal-slide active">
            <img src={carouselImages[activeSlide]} alt={t('appScreenshotAlt')} onError={(e) => { e.currentTarget.src = '/data/icon.png'; }} />
          </div>
          <button
            type="button"
            className="modal-slide side"
            onClick={() => navigateCarousel(1)}
            aria-label={t('nextImage')}
          >
            <img src={carouselImages[nextSlide]} alt={t('appScreenshotAlt')} onError={(e) => { e.currentTarget.src = '/data/icon.png'; }} />
          </button>
        </div>

        <div className="modal-buttons">
          {isAndroid ? (
            <a href={androidAppUrl} target="_blank" rel="noopener noreferrer" className="store-badge-link">
              <img className="store-badge-image" src={androidBadgeSrc} alt="Google Play" />
            </a>
          ) : isIOS ? (
            <a href={iOSAppUrl} target="_blank" rel="noopener noreferrer" className="store-badge-link">
              <img className="store-badge-image" src={iOSBadgeSrc} alt="App Store" />
            </a>
          ) : (
            <>
              <a href={androidAppUrl} target="_blank" rel="noopener noreferrer" className="store-badge-link">
                <img className="store-badge-image" src={androidBadgeSrc} alt="Google Play" />
              </a>
              <a href={iOSAppUrl} target="_blank" rel="noopener noreferrer" className="store-badge-link">
                <img className="store-badge-image" src={iOSBadgeSrc} alt="App Store" />
              </a>
            </>
          )}
        </div>
        <p className="modal-availability">{t('appAvailability')}</p>
      </div>
    </div>
  );
}

function PrivacyModal({ onClose, t }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content privacy-modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label={t('closeModal')}
        >
          ✕
        </button>

        <img
          src="/data/banana.png"
          alt={t('bananaAlt')}
          className="privacy-modal-image"
        />

        <h2 className="modal-title">{t('privacyTitle')}</h2>
        <p className="modal-text privacy-modal-text">{t('privacyText')}</p>
      </div>
    </div>
  );
}

function TermsModal({ onClose, t }) {
  const termsSections = t('termsSections');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content terms-modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label={t('closeModal')}
        >
          ✕
        </button>

        <h2 className="modal-title">{t('termsTitle')}</h2>
        <p className="modal-text terms-modal-notice">{t('termsEnglishNotice')}</p>

        <div className="terms-modal-body">
          {termsSections.map((section) => (
            <section key={section.title} className="terms-section">
              <h3 className="terms-section-title">{section.title}</h3>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="terms-paragraph">{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

function ProductCard({ item, monthIndex, onFavoriteClick, onClick, locale, t }) {
  const seasonGroups = collapseSeasonGroups(item.seasons);
  const itemName = getLocalizedItemName(item, locale);
  const itemPath = getLocalizedItemPath(item.image, locale);

  return (
    <article
      className={`product-card ${item.free ? '' : 'locked'}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <button
        type="button"
        className="favorite-button"
        onClick={(e) => { e.stopPropagation(); onFavoriteClick(); }}
        aria-label={`${itemName} ${t('saveFavorite').toLowerCase()}`}
      >
        <HeartIcon />
      </button>
      <div className="product-image">
        <img src={`/data/images/${item.image.toLowerCase()}.jpg`} alt={itemName} />
      </div>
      <div className="product-info">
        <p className="product-latin">{item.latName}</p>
        <h3 className="product-name">
          {item.free ? (
            <Link
              to={itemPath}
              className="product-name-link"
              onClick={(event) => event.stopPropagation()}
            >
              {itemName}
            </Link>
          ) : (
            itemName
          )}
        </h3>
        <div className="availability-grid">
          {seasonGroups.map((group, index) => (
            <div
              key={`${group.season}-${index}`}
              className={`season-segment ${group.season}`}
              style={{ flex: group.length }}
              title={t(group.length === 1 ? 'monthCount.one' : 'monthCount.other', {
                count: group.length,
                season: t(`seasonNames.${group.season}`),
              })}
            />
          ))}
          <div className="month-marker" style={{ left: `${(monthIndex + 0.5) * (100 / 12)}%` }} />
        </div>
      </div>
    </article>
  );
}
