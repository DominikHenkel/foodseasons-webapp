import { useEffect } from 'react';
import { FaLeaf, FaTint, FaSun, FaSnowflake, FaBox, FaWind, FaChevronLeft, FaRegHeart, FaThermometerHalf } from 'react-icons/fa';
import { getLocalizedHints, getLocalizedItemName, getLocalizedStorageNote, translations } from './i18n';

function formatTemperatureRange(item, unit, t) {
  const convertTemperature = (value) => {
    if (unit === 'fahrenheit') {
      return Math.round((value * 9) / 5 + 32);
    }

    return value;
  };

  const suffix = unit === 'fahrenheit' ? '° F' : '° C';
  const min = item.tempMin;
  const max = item.tempMax;

  if (min !== undefined && max !== undefined) {
    return `${convertTemperature(min)}${suffix} - ${convertTemperature(max)}${suffix}`;
  }

  if (min !== undefined) {
    return t('fromTemperature', { value: convertTemperature(min) }).replace('° C', suffix);
  }

  if (max !== undefined) {
    return t('toTemperature', { value: convertTemperature(max) }).replace('° C', suffix);
  }

  return null;
}

function DetailPage({ item, onBack, onFavoriteClick, locale, t, temperatureUnit }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [item]);

  const currentMonthIndex = new Date().getMonth();
  const monthLetters = translations[locale].monthLetters;
  const itemName = getLocalizedItemName(item, locale);
  const hints = getLocalizedHints(item, locale);
  const storageNote = getLocalizedStorageNote(item, locale);
  const durability = item.durability ? t(`durability.${item.durability}`) : null;

  return (
    <div className="detail-page">
      <div className="detail-hero">
        <button type="button" className="detail-back" onClick={onBack} aria-label={t('back')}>
          <BackIcon />
        </button>
        <img
          src={`/data/images/${item.image.toLowerCase()}.jpg`}
          alt={itemName}
          className="detail-image"
        />
      </div>

      <div className="detail-body">
        <div className="detail-title-row">
          <div>
            <h1 className="detail-name">{itemName}</h1>
            <p className="detail-latin">{item.latName}</p>
          </div>
          <div className="detail-actions">
            <button type="button" className="detail-action-btn" onClick={onFavoriteClick} aria-label={t('saveFavorite')}>
              <HeartOutlineIcon />
            </button>
          </div>
        </div>

        <div className="detail-months-card">
          {monthLetters.map((letter, index) => {
            const season = item.seasons?.[index] ?? 'import';
            const isCurrent = index === currentMonthIndex;
            return (
              <div key={index} className={`detail-month-cell ${season} ${isCurrent ? 'current' : ''}`}>
                <span className="detail-month-letter">{letter}</span>
              </div>
            );
          })}
        </div>

        <div className="detail-sections">
          {item.ethylen && (
            <section className="detail-section">
              <h2 className="detail-section-title">{t('ethylene')}</h2>
              <div className="detail-info-row">
                <div className="detail-info-icon-wrap">
                  <FaWind className="thermo-icon" aria-hidden="true" />
                </div>
                <div>
                  <p className="detail-info-sub" style={{ marginTop: '10px' }}>
                    {t('ethyleneText')}
                  </p>
                </div>
              </div>
            </section>
          )}

          <section className="detail-section">
            <h2 className="detail-section-title">{t('storage')}</h2>

            {(item.tempMin !== undefined || item.tempMax !== undefined) && (
              <div className="detail-info-row">
                <div className="detail-info-icon-wrap">
                  <ThermometerIcon />
                </div>
                <div>
                  <p className="detail-info-main">
                    {formatTemperatureRange(item, temperatureUnit, t)}
                  </p>
                  <p className="detail-info-sub">{storageNote}</p>
                  {durability && (
                    <p className="detail-info-durability">
                      {t('durabilitySentence', {
                        foodType: t(`foodTypes.${item.foodType}`),
                        durability,
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="detail-section">
            <h2 className="detail-section-title">{t('tips')}</h2>
            {hints && hints.length > 0 ? (
              <div className="detail-hints">
                {hints.map((hint, i) => (
                  <div key={i} className="detail-info-row">
                    <div className="detail-info-icon-wrap">
                      <HintIcon name={hint.icon} color={hint.iconColor} />
                    </div>
                    <div>
                      <p className="detail-hint-text" style={{ marginTop: '10px' }}>{hint.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="detail-info-sub">{t('noHints')}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function BackIcon() {
  return <FaChevronLeft className="back-icon" aria-hidden="true" />;
}

function HeartOutlineIcon() {
  return <FaRegHeart className="action-icon" aria-hidden="true" />;
}

function ThermometerIcon() {
  return <FaThermometerHalf className="thermo-icon" aria-hidden="true" />;
}

function HintIcon({ name, color }) {
  const iconColor = {
    blue: '#3182ce',
    green: '#2f855a',
    orange: '#dd6b20',
    gray: '#4a5568',
    red: '#e53e3e',
  }[color] ?? '#4a5568';

  const iconProps = { size: 18, color: iconColor };

  switch (name) {
    case 'drop.fill':
    case 'drop.triangle.fill':
      return <FaTint className="hint-icon" {...iconProps} />;
    case 'leaf.fill':
      return <FaLeaf className="hint-icon" {...iconProps} />;
    case 'sun.min':
      return <FaSun className="hint-icon" {...iconProps} />;
    case 'snow':
      return <FaSnowflake className="hint-icon" {...iconProps} />;
    case 'shippingbox.fill':
      return <FaBox className="hint-icon" {...iconProps} />;
    case 'move.3d':
      return <FaWind className="hint-icon" {...iconProps} />;
    default:
      return <FaTint className="hint-icon" {...iconProps} />;
  }
}

export default DetailPage;
