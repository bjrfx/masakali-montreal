import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, MessageCircleMore, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  createQuickBotAPI,
  getActions,
  getLocationOptions,
  getStepProgress,
  normalizePhoneDigits,
} from './QuickBotFlow';
import quickBotConfig from './quickbot.config';
import './QuickBot.css';

const INITIAL_IDENTIFY = {
  phone: '',
  email: '',
};

const INITIAL_BOOK = {
  locationId: '',
  date: '',
  time: '',
  persons: 2,
  name: '',
  email: '',
  phone: '',
  special_requests: '',
};

const INITIAL_UPDATE = {
  date: '',
  time: '',
  persons: 2,
  special_requests: '',
};

const INITIAL_CATERING = {
  event_type: '',
  event_date: '',
  guests: 20,
  event_location: '',
  notes: '',
  name: '',
  email: '',
  phone: '',
};

const INITIAL_CONTACT = {
  name: '',
  email: '',
  phone: '',
  message: '',
};

const BOOK_STEP_KEYS = [
  { id: 'location', labelKey: 'quickbot.stepLocation' },
  { id: 'date', labelKey: 'quickbot.stepDate' },
  { id: 'time', labelKey: 'quickbot.stepTime' },
  { id: 'persons', labelKey: 'quickbot.stepGuests' },
  { id: 'name', labelKey: 'quickbot.stepName' },
  { id: 'email', labelKey: 'quickbot.stepEmail' },
  { id: 'phone', labelKey: 'quickbot.stepPhone' },
  { id: 'special', labelKey: 'quickbot.stepSpecial' },
];

function useTypingText(value, speed = 18) {
  const [text, setText] = useState('');

  useEffect(() => {
    let timer;
    setText('');

    if (!value) {
      return undefined;
    }

    let index = 0;
    const tick = () => {
      index += 1;
      setText(value.slice(0, index));
      if (index < value.length) {
        timer = window.setTimeout(tick, speed);
      }
    };

    timer = window.setTimeout(tick, speed);

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [value, speed]);

  return text;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function sanitizePhoneInput(value) {
  return normalizePhoneDigits(value).slice(0, 10);
}

function buildProgressMeta(screen, step, t) {
  if (screen === 'book') {
    return {
      step,
      total: BOOK_STEP_KEYS.length,
      label: t(BOOK_STEP_KEYS[step]?.labelKey || 'quickbot.booking'),
    };
  }
  return null;
}

function filterMenuCategoryMatch(categories, label) {
  const normalized = String(label || '').toLowerCase();
  return categories.find((item) => {
    const name = String(item.name || '').toLowerCase();
    const slug = String(item.slug || '').toLowerCase();
    return name.includes(normalized) || slug.includes(normalized.replace(/\s+/g, '-'));
  });
}

export default function QuickBot({ config = quickBotConfig }) {
  const { t } = useTranslation();
  const api = useMemo(() => createQuickBotAPI(config), [config]);

  const [isOpen, setIsOpen] = useState(false);
  const [screen, setScreen] = useState('identify');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [identity, setIdentity] = useState(INITIAL_IDENTIFY);
  const [lookupReservations, setLookupReservations] = useState([]);
  const [hasReservations, setHasReservations] = useState(false);

  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  const [book, setBook] = useState(INITIAL_BOOK);
  const [bookStep, setBookStep] = useState(0);

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [reservationUpdate, setReservationUpdate] = useState(INITIAL_UPDATE);

  const [menuLocationId, setMenuLocationId] = useState(config.locations?.[0]?.id || '');
  const [menuSearch, setMenuSearch] = useState('');
  const [menuItems, setMenuItems] = useState([]);

  const [catering, setCatering] = useState(INITIAL_CATERING);
  const [contact, setContact] = useState(INITIAL_CONTACT);

  const [successMessage, setSuccessMessage] = useState('');

  const activeMenuLocation = useMemo(
    () => locationOptions.find((location) => location.id === menuLocationId) || locationOptions[0] || null,
    [menuLocationId, locationOptions]
  );

  const progressMeta = buildProgressMeta(screen, bookStep, t);
  const progress = getStepProgress(progressMeta);

  const botMessage = hasReservations
    ? t('quickbot.welcomeBack')
    : t('quickbot.welcomeNew');
  const typingMessage = useTypingText(screen === 'actions' ? botMessage : '', 14);

  const shouldHideByRoute = config.hideOnAdminRoutes && window.location.pathname.startsWith('/admin');

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    async function preload() {
      try {
        setLoading(true);
        setError('');
        const [restaurantRows, categoryRows] = await Promise.all([
          api.getRestaurants(),
          api.getCategories(activeMenuLocation),
        ]);
        if (cancelled) return;
        setRestaurants(restaurantRows);
        setCategories(categoryRows);
        const locationList = getLocationOptions(config, restaurantRows);
        setLocationOptions(locationList);
        if (!menuLocationId && locationList[0]) {
          setMenuLocationId(locationList[0].id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || t('quickbot.errorLoad'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    preload();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!activeMenuLocation || !isOpen) return;
    api.getCategories(activeMenuLocation)
      .then(setCategories)
      .catch(() => {
        setCategories([]);
      });
  }, [menuLocationId, isOpen]);

  useEffect(() => {
    const onEsc = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  if (shouldHideByRoute) return null;

  function pushAndGo(nextScreen) {
    setHistory((prev) => [...prev, screen]);
    setScreen(nextScreen);
    setError('');
  }

  function goBack() {
    setError('');
    setHistory((prev) => {
      if (!prev.length) return prev;
      const stack = [...prev];
      const last = stack.pop();
      if (last) setScreen(last);
      return stack;
    });
  }

  function openQuickBot() {
    setIsOpen((prev) => !prev);
  }

  async function handleIdentifySubmit(event) {
    event.preventDefault();
    const normalizedPhone = normalizePhoneDigits(identity.phone);
    if (!identity.email || normalizedPhone.length !== 10) {
      setError(t('quickbot.errorEmailPhone'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      const reservations = await api.findReservations(identity);
      setLookupReservations(reservations);
      setHasReservations(reservations.length > 0);

      setBook((prev) => ({
        ...prev,
        email: identity.email,
        phone: identity.phone,
      }));
      setCatering((prev) => ({
        ...prev,
        email: identity.email,
        phone: identity.phone,
      }));
      setContact((prev) => ({
        ...prev,
        email: identity.email,
        phone: identity.phone,
      }));

      pushAndGo('actions');
    } catch (err) {
      setError(err.message || t('quickbot.errorVerify'));
    } finally {
      setLoading(false);
    }
  }

  function handleAction(actionId) {
    if (actionId === 'book-table') {
      setBookStep(0);
      setBook((prev) => ({
        ...INITIAL_BOOK,
        email: identity.email,
        phone: identity.phone,
        date: todayISO(),
      }));
      pushAndGo('book');
      return;
    }

    if (actionId === 'view-reservations') {
      pushAndGo('view-reservations');
      return;
    }

    if (actionId === 'update-reservation') {
      pushAndGo('choose-reservation-to-update');
      return;
    }

    if (actionId === 'search-menu') {
      setMenuItems([]);
      setMenuSearch('');
      pushAndGo('search-menu');
      return;
    }

    if (actionId === 'view-menu') {
      setMenuItems([]);
      pushAndGo('view-menu');
      return;
    }

    if (actionId === 'catering') {
      setCatering((prev) => ({ ...prev, email: identity.email, phone: identity.phone }));
      pushAndGo('catering');
      return;
    }

    if (actionId === 'contact') {
      setContact((prev) => ({ ...prev, email: identity.email, phone: identity.phone }));
      pushAndGo('contact');
      return;
    }

    if (actionId === 'locations') {
      pushAndGo('locations');
      return;
    }

    if (actionId === 'call') {
      pushAndGo('call');
    }
  }

  function handleBookNext(event) {
    event.preventDefault();

    const validations = [
      !!book.locationId,
      !!book.date,
      !!book.time,
      Number(book.persons) > 0,
      normalizePhoneDigits(book.name).length === 0 && !!book.name,
      !!book.email,
      normalizePhoneDigits(book.phone).length === 10,
      true,
    ];

    if (!validations[bookStep]) {
      setError(t('quickbot.errorCompleteStep'));
      return;
    }

    setError('');

    if (bookStep === BOOK_STEP_KEYS.length - 1) {
      submitBooking();
      return;
    }

    setBookStep((prev) => prev + 1);
  }

  async function submitBooking() {
    try {
      setLoading(true);
      setError('');
      const location = locationOptions.find((item) => item.id === book.locationId) || null;
      await api.createReservation({
        ...book,
        location,
        restaurants,
      });

      setSuccessMessage(t('quickbot.reservationConfirmed'));
      setLookupReservations(await api.findReservations(identity));
      setHasReservations(true);
      pushAndGo('success');
    } catch (err) {
      setError(err.message || t('quickbot.errorSubmitReservation'));
    } finally {
      setLoading(false);
    }
  }

  function startUpdateReservation(item) {
    setSelectedReservation(item);
    setReservationUpdate({
      date: item.date || todayISO(),
      time: item.time || '',
      persons: item.persons || 2,
      special_requests: item.special_requests || '',
    });
    pushAndGo('update-reservation');
  }

  async function submitReservationUpdate(event) {
    event.preventDefault();
    if (!selectedReservation) {
      setError(t('quickbot.errorSelectReservation'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.updateReservation({
        id: selectedReservation.id,
        lookup_email: identity.email,
        lookup_phone: identity.phone,
        ...reservationUpdate,
      });
      const refreshed = await api.findReservations(identity);
      setLookupReservations(refreshed);
      setSuccessMessage(t('quickbot.reservationUpdated'));
      pushAndGo('success');
    } catch (err) {
      setError(err.message || t('quickbot.errorUpdateReservation'));
    } finally {
      setLoading(false);
    }
  }

  async function runMenuSearch(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      const results = await api.searchMenu({ location: activeMenuLocation, query: menuSearch });
      setMenuItems(results);
    } catch (err) {
      setError(err.message || t('quickbot.errorSearchMenu'));
    } finally {
      setLoading(false);
    }
  }

  async function loadMenuByCategory(categoryLabel) {
    try {
      setLoading(true);
      setError('');
      let categoryId = '';
      const foundCategory = filterMenuCategoryMatch(categories, categoryLabel);
      if (foundCategory) {
        categoryId = foundCategory.id;
      }
      const results = await api.getMenuByCategory({
        location: activeMenuLocation,
        categoryId,
      });
      const categoryNormalized = String(categoryLabel || '').toLowerCase();
      const filtered = results.filter((item) => {
        if (!categoryNormalized) return true;
        const categoryText = String(item.category_name || '').toLowerCase();
        return categoryText.includes(categoryNormalized) || !foundCategory;
      });
      setMenuItems(filtered.length ? filtered : results);
    } catch (err) {
      setError(err.message || t('quickbot.errorFetchCategory'));
    } finally {
      setLoading(false);
    }
  }

  async function submitCatering(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      const locationName = locationOptions.find((item) => item.id === catering.event_location)?.name || catering.event_location;
      await api.submitCatering({ ...catering, event_location: locationName });
      setSuccessMessage(t('quickbot.cateringSubmitted'));
      pushAndGo('success');
    } catch (err) {
      setError(err.message || t('quickbot.errorSubmitCatering'));
    } finally {
      setLoading(false);
    }
  }

  async function submitContact(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      await api.submitContact(contact);
      setSuccessMessage(t('quickbot.messageSent'));
      pushAndGo('success');
    } catch (err) {
      setError(err.message || t('quickbot.errorSubmitContact'));
    } finally {
      setLoading(false);
    }
  }

  function renderBookingStep() {
    if (bookStep === 0) {
      return (
        <div>
          <label className="quickbot-label">{t('quickbot.location')}</label>
          <select
            className="quickbot-select"
            value={book.locationId}
            onChange={(event) => setBook((prev) => ({ ...prev, locationId: event.target.value }))}
          >
            <option value="">{t('quickbot.selectLocation')}</option>
            {locationOptions.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (bookStep === 1) {
      return (
        <div>
          <label className="quickbot-label">{t('quickbot.reservationDate')}</label>
          <input
            className="quickbot-input"
            type="date"
            min={todayISO()}
            value={book.date}
            onChange={(event) => setBook((prev) => ({ ...prev, date: event.target.value }))}
          />
        </div>
      );
    }

    if (bookStep === 2) {
      return (
        <div>
          <label className="quickbot-label">{t('quickbot.reservationTime')}</label>
          <input
            className="quickbot-input"
            type="time"
            value={book.time}
            onChange={(event) => setBook((prev) => ({ ...prev, time: event.target.value }))}
          />
        </div>
      );
    }

    if (bookStep === 3) {
      return (
        <div>
          <label className="quickbot-label">{t('quickbot.numberOfGuests')}</label>
          <input
            className="quickbot-input"
            type="number"
            min="1"
            max="30"
            value={book.persons}
            onChange={(event) => setBook((prev) => ({ ...prev, persons: event.target.value }))}
          />
        </div>
      );
    }

    if (bookStep === 4) {
      return (
        <div>
          <label className="quickbot-label">{t('quickbot.yourName')}</label>
          <input
            className="quickbot-input"
            value={book.name}
            onChange={(event) => setBook((prev) => ({ ...prev, name: event.target.value }))}
          />
        </div>
      );
    }

    if (bookStep === 5) {
      return (
        <div>
          <label className="quickbot-label">{t('quickbot.email')}</label>
          <input
            className="quickbot-input"
            type="email"
            value={book.email}
            onChange={(event) => setBook((prev) => ({ ...prev, email: event.target.value }))}
          />
        </div>
      );
    }

    if (bookStep === 6) {
      return (
        <div>
          <label className="quickbot-label">{t('quickbot.phone')}</label>
          <input
            className="quickbot-input"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
            value={book.phone}
              onChange={(event) => setBook((prev) => ({ ...prev, phone: sanitizePhoneInput(event.target.value) }))}
          />
        </div>
      );
    }

    return (
      <div>
        <label className="quickbot-label">{t('quickbot.specialRequests')}</label>
        <textarea
          className="quickbot-textarea"
          value={book.special_requests}
          onChange={(event) => setBook((prev) => ({ ...prev, special_requests: event.target.value }))}
          placeholder={t('quickbot.specialRequestsPlaceholder')}
        />
      </div>
    );
  }

  function renderScreen() {
    if (screen === 'identify') {
      return (
        <form className="quickbot-form" onSubmit={handleIdentifySubmit}>
          <div className="quickbot-bubble">{t('quickbot.identifyBubble')}</div>
          <div>
            <label className="quickbot-label">{t('quickbot.phoneNumber')}</label>
            <input
              className="quickbot-input"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={identity.phone}
              onChange={(event) => setIdentity((prev) => ({ ...prev, phone: sanitizePhoneInput(event.target.value) }))}
              placeholder="6135551234"
            />
          </div>
          <div>
            <label className="quickbot-label">{t('quickbot.emailAddress')}</label>
            <input
              className="quickbot-input"
              type="email"
              value={identity.email}
              onChange={(event) => setIdentity((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="you@example.com"
            />
          </div>
          <button className="quickbot-btn primary" type="submit" disabled={loading}>
            {loading ? t('quickbot.checking') : t('quickbot.continue')}
          </button>
        </form>
      );
    }

    if (screen === 'actions') {
      const actions = getActions({ hasReservations });
      return (
        <div>
          <div className="quickbot-bubble">
            {typingMessage || '...'}
            {!typingMessage && (
              <span className="quickbot-typing">
                <span className="quickbot-dot" />
                <span className="quickbot-dot" />
                <span className="quickbot-dot" />
              </span>
            )}
          </div>
          <div className="quickbot-grid">
            {actions.map((action) => (
              <button key={action.id} className="quickbot-btn secondary" onClick={() => handleAction(action.id)}>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (screen === 'book') {
      return (
        <form className="quickbot-form" onSubmit={handleBookNext}>
          <div className="quickbot-bubble">{t(BOOK_STEP_KEYS[bookStep]?.labelKey || 'quickbot.booking')}</div>
          {renderBookingStep()}
          <div className="quickbot-grid two">
            <button
              type="button"
              className="quickbot-btn ghost"
              onClick={() => {
                if (bookStep === 0) {
                  goBack();
                } else {
                  setBookStep((prev) => Math.max(prev - 1, 0));
                }
              }}
            >
              {t('quickbot.back')}
            </button>
            <button type="submit" className="quickbot-btn primary" disabled={loading}>
              {bookStep === BOOK_STEP_KEYS.length - 1 ? (loading ? t('quickbot.submitting') : t('quickbot.submit')) : t('quickbot.next')}
            </button>
          </div>
        </form>
      );
    }

    if (screen === 'view-reservations') {
      return (
        <div className="quickbot-grid">
          {!lookupReservations.length && <div className="quickbot-empty">{t('quickbot.noReservationsFound')}</div>}
          {lookupReservations.map((item) => (
            <div className="quickbot-card" key={item.id}>
              <h4 className="quickbot-card-title">{item.restaurant_name || t('quickbot.reservation')}</h4>
              <p className="quickbot-meta">
                {t('quickbot.date')}: {item.date}<br />
                {t('quickbot.time')}: {item.time}<br />
                {t('quickbot.guests')}: {item.persons}<br />
                {t('quickbot.status')}: {item.status}
              </p>
              <div className="quickbot-grid two">
                {/* <button className="quickbot-btn secondary" onClick={() => startUpdateReservation(item)}>
                  Update Reservation
                </button> */}
                <button className="quickbot-btn secondary" onClick={() => pushAndGo('cancel-fallback')}>
                  {t('quickbot.updateReservation')}
                </button>
                <button className="quickbot-btn ghost" onClick={() => pushAndGo('cancel-fallback')}>
                  {t('quickbot.cancelReservation')}
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (screen === 'choose-reservation-to-update') {
      return (
        <div className="quickbot-grid">
          <div className="quickbot-bubble">{t('quickbot.selectReservationToUpdate')}</div>
          {!lookupReservations.length && <div className="quickbot-empty">{t('quickbot.noReservationsFound')}</div>}
          {lookupReservations.map((item) => (
            <button key={item.id} className="quickbot-btn secondary" onClick={() => startUpdateReservation(item)}>
              {item.date} · {item.time} · {item.persons} {t('quickbot.guests')}
            </button>
          ))}
        </div>
      );
    }

    if (screen === 'update-reservation') {
      return (
        <form className="quickbot-form" onSubmit={submitReservationUpdate}>
          <div className="quickbot-bubble">{t('quickbot.updateReservation')}</div>
          <div>
            <label className="quickbot-label">{t('quickbot.date')}</label>
            <input
              type="date"
              className="quickbot-input"
              value={reservationUpdate.date}
              min={todayISO()}
              onChange={(event) => setReservationUpdate((prev) => ({ ...prev, date: event.target.value }))}
            />
          </div>
          <div>
            <label className="quickbot-label">{t('quickbot.time')}</label>
            <input
              type="time"
              className="quickbot-input"
              value={reservationUpdate.time}
              onChange={(event) => setReservationUpdate((prev) => ({ ...prev, time: event.target.value }))}
            />
          </div>
          <div>
            <label className="quickbot-label">{t('quickbot.guests')}</label>
            <input
              type="number"
              min="1"
              max="30"
              className="quickbot-input"
              value={reservationUpdate.persons}
              onChange={(event) => setReservationUpdate((prev) => ({ ...prev, persons: event.target.value }))}
            />
          </div>
          <div>
            <label className="quickbot-label">{t('quickbot.specialRequest')}</label>
            <textarea
              className="quickbot-textarea"
              value={reservationUpdate.special_requests}
              onChange={(event) => setReservationUpdate((prev) => ({ ...prev, special_requests: event.target.value }))}
            />
          </div>
          <button className="quickbot-btn primary" type="submit" disabled={loading}>
            {loading ? t('quickbot.updating') : t('quickbot.saveUpdate')}
          </button>
        </form>
      );
    }

    if (screen === 'search-menu') {
      return (
        <div className="quickbot-form">
          <form onSubmit={runMenuSearch} className="quickbot-form">
            <label className="quickbot-label">{t('quickbot.searchMenuItem')}</label>
            <input
              className="quickbot-input"
              value={menuSearch}
              onChange={(event) => setMenuSearch(event.target.value)}
              placeholder={t('quickbot.typeDishName')}
            />
            <label className="quickbot-label">Location</label>
            <select
              className="quickbot-select"
              value={menuLocationId}
              onChange={(event) => setMenuLocationId(event.target.value)}
            >
              {locationOptions.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
            <button className="quickbot-btn primary" type="submit" disabled={loading}>
              {loading ? t('quickbot.searching') : t('quickbot.search')}
            </button>
          </form>
          {!!menuItems.length && (
            <div className="quickbot-grid">
              {menuItems.map((item) => (
                <div className="quickbot-card" key={item.id}>
                  <div className="quickbot-item-row">
                    <img className="quickbot-item-image" src={item.image_url || '/logo192.png'} alt={item.name} />
                    <div>
                      <h4 className="quickbot-card-title">{item.name}</h4>
                      <p className="quickbot-meta">
                        ${item.price.toFixed(2)}<br />
                        {item.description || t('quickbot.noDescription')}
                      </p>
                      <span className="quickbot-badge">{t('quickbot.spice')}: {item.spice_level || 'medium'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && !menuItems.length && <div className="quickbot-empty">{t('quickbot.searchResultsHere')}</div>}
        </div>
      );
    }

    if (screen === 'view-menu') {
      return (
        <div className="quickbot-form">
          <label className="quickbot-label">{t('quickbot.location')}</label>
          <select className="quickbot-select" value={menuLocationId} onChange={(event) => setMenuLocationId(event.target.value)}>
            {locationOptions.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          <div className="quickbot-grid">
            {config.menuCategories.map((category) => (
              <button
                key={category.key}
                className="quickbot-btn secondary"
                onClick={() => loadMenuByCategory(category.label)}
              >
                {category.label}
              </button>
            ))}
          </div>
          {!!menuItems.length && (
            <div className="quickbot-grid">
              {menuItems.map((item) => (
                <div className="quickbot-card" key={item.id}>
                  <h4 className="quickbot-card-title">{item.name}</h4>
                  <p className="quickbot-meta">
                    ${item.price.toFixed(2)}<br />
                    {item.description || t('quickbot.noDescription')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (screen === 'catering') {
      return (
        <form className="quickbot-form" onSubmit={submitCatering}>
          <div>
            <label className="quickbot-label">{t('quickbot.eventType')}</label>
            <input
              className="quickbot-input"
              value={catering.event_type}
              onChange={(event) => setCatering((prev) => ({ ...prev, event_type: event.target.value }))}
            />
          </div>
          <div>
            <label className="quickbot-label">{t('quickbot.eventDate')}</label>
            <input
              type="date"
              min={todayISO()}
              className="quickbot-input"
              value={catering.event_date}
              onChange={(event) => setCatering((prev) => ({ ...prev, event_date: event.target.value }))}
            />
          </div>
          <div>
            <label className="quickbot-label">{t('quickbot.numberOfGuests')}</label>
            <input
              type="number"
              min="10"
              className="quickbot-input"
              value={catering.guests}
              onChange={(event) => setCatering((prev) => ({ ...prev, guests: event.target.value }))}
            />
          </div>
          <div>
            <label className="quickbot-label">Location</label>
            <select
              className="quickbot-select"
              value={catering.event_location}
              onChange={(event) => setCatering((prev) => ({ ...prev, event_location: event.target.value }))}
            >
              <option value="">{t('quickbot.selectLocation')}</option>
              {locationOptions.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="quickbot-label">{t('quickbot.notes')}</label>
            <textarea
              className="quickbot-textarea"
              value={catering.notes}
              onChange={(event) => setCatering((prev) => ({ ...prev, notes: event.target.value }))}
            />
          </div>
          <div>
            <label className="quickbot-label">{t('quickbot.name')}</label>
            <input
              className="quickbot-input"
              value={catering.name}
              onChange={(event) => setCatering((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div>
            <label className="quickbot-label">{t('quickbot.email')}</label>
            <input
              type="email"
              className="quickbot-input"
              value={catering.email}
              onChange={(event) => setCatering((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>
          <div>
            <label className="quickbot-label">{t('quickbot.phone')}</label>
            <input
              className="quickbot-input"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={catering.phone}
              onChange={(event) => setCatering((prev) => ({ ...prev, phone: sanitizePhoneInput(event.target.value) }))}
            />
          </div>
          <button className="quickbot-btn primary" type="submit" disabled={loading}>
            {loading ? t('quickbot.submitting') : t('quickbot.submitCateringRequest')}
          </button>
        </form>
      );
    }

    if (screen === 'contact') {
      return (
        <form className="quickbot-form" onSubmit={submitContact}>
          <div>
            <label className="quickbot-label">{t('quickbot.name')}</label>
            <input
              className="quickbot-input"
              value={contact.name}
              onChange={(event) => setContact((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div>
            <label className="quickbot-label">{t('quickbot.email')}</label>
            <input
              type="email"
              className="quickbot-input"
              value={contact.email}
              onChange={(event) => setContact((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>
          <div>
            <label className="quickbot-label">{t('quickbot.phone')}</label>
            <input
              className="quickbot-input"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={contact.phone}
              onChange={(event) => setContact((prev) => ({ ...prev, phone: sanitizePhoneInput(event.target.value) }))}
            />
          </div>
          <div>
            <label className="quickbot-label">{t('quickbot.message')}</label>
            <textarea
              className="quickbot-textarea"
              value={contact.message}
              onChange={(event) => setContact((prev) => ({ ...prev, message: event.target.value }))}
            />
          </div>
          <button className="quickbot-btn primary" type="submit" disabled={loading}>
            {loading ? t('quickbot.sending') : t('quickbot.sendMessage')}
          </button>
        </form>
      );
    }

    if (screen === 'locations') {
      return (
        <div className="quickbot-grid">
          {restaurants.length === 0 && <div className="quickbot-empty">{t('quickbot.noLocations')}</div>}
          {restaurants.map((location) => (
            <div key={location.id} className="quickbot-card">
              <h4 className="quickbot-card-title">{location.name}</h4>
              <p className="quickbot-meta">
                {location.address}<br />
                {location.phone || t('quickbot.phoneNotAvailable')}<br />
                {location.opening_hours}
              </p>
              <div className="quickbot-grid two">
                <button
                  className="quickbot-btn secondary"
                  onClick={() => {
                    const preferred = locationOptions.find((item) => item.slug === location.slug) || locationOptions[0];
                    if (preferred) setMenuLocationId(preferred.id);
                    pushAndGo('view-menu');
                  }}
                >
                  {t('quickbot.viewMenu')}
                </button>
                <button
                  className="quickbot-btn primary"
                  onClick={() => {
                    const preferred = locationOptions.find((item) => item.slug === location.slug) || locationOptions[0];
                    setBook((prev) => ({ ...prev, locationId: preferred?.id || prev.locationId }));
                    setBookStep(0);
                    pushAndGo('book');
                  }}
                >
                  {t('quickbot.bookTable')}
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (screen === 'call') {
      return (
        <div className="quickbot-grid">
          <div className="quickbot-bubble">{t('quickbot.chooseLocationToCall')}</div>
          {locationOptions.map((location) => (
            <a
              key={location.id}
              href={location.tel ? `tel:${location.tel}` : undefined}
              className="quickbot-btn secondary"
              onClick={(event) => {
                if (!location.tel) {
                  event.preventDefault();
                  setError(t('quickbot.phoneUnavailable'));
                }
              }}
            >
              {location.name} {location.phone || ''}
            </a>
          ))}
        </div>
      );
    }

    if (screen === 'cancel-fallback') {
      return (
        <div className="quickbot-form">
          <div className="quickbot-bubble">
            {t('quickbot.cancelFallbackMessage')}
            <br />
            {locationOptions.map((location) => (
            <a
              key={location.id}
              href={location.tel ? `tel:${location.tel}` : undefined}
              className="quickbot-btn secondary"
              onClick={(event) => {
                if (!location.tel) {
                  event.preventDefault();
                  setError(t('quickbot.phoneUnavailable'));
                }
              }}
            >
              {location.name} {location.phone || ''}
            </a>
          ))}
          </div>
          <button
            className="quickbot-btn primary"
            onClick={() => {
              setContact((prev) => ({
                ...prev,
                email: prev.email || identity.email,
                phone: prev.phone || identity.phone,
                message:
                  prev.message ||
                  t('quickbot.cancelMessage'),
              }));
              pushAndGo('contact');
            }}
          >
            {t('quickbot.continueToContact')}
          </button>
        </div>
      );
    }

    if (screen === 'success') {
      return (
        <div className="quickbot-form">
          <div className="quickbot-bubble">{successMessage || t('quickbot.doneSuccessfully')}</div>
          <button className="quickbot-btn primary" onClick={() => setScreen('actions')}>
            {t('quickbot.backToActions')}
          </button>
        </div>
      );
    }

    return <div className="quickbot-empty">{t('quickbot.selectOption')}</div>;
  }

  return (
    <div className="quickbot-root" style={{ '--qb-primary': config.themeColor }}>
      <div className={`quickbot-panel ${isOpen ? 'open' : ''}`} role="dialog" aria-label="Quick assistant panel">
        <div className="quickbot-header">
          {history.length > 0 ? (
            <button className="quickbot-icon-btn" onClick={goBack} aria-label="Back">
              <ChevronLeft size={16} />
            </button>
          ) : (
            <span className="quickbot-icon-btn" aria-hidden="true">
              <Sparkles size={15} />
            </span>
          )}
          <div className="quickbot-title-wrap">
            <h3 className="quickbot-title">{config.assistantName || 'Quick Bot'}</h3>
            <p className="quickbot-subtitle">{t('quickbot.subtitle')}</p>
          </div>
          <button className="quickbot-icon-btn" onClick={() => setIsOpen(false)} aria-label="Close">
            <X size={15} />
          </button>
        </div>
        {progressMeta && (
          <div className="quickbot-progress" aria-hidden="true">
            <div className="quickbot-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
        <div className="quickbot-body">
          {error && <div className="quickbot-empty">{error}</div>}
          {renderScreen()}
          <div className="quickbot-footer-gap" />
        </div>
      </div>

      <button className="quickbot-fab" onClick={openQuickBot} aria-label="Toggle Quick Bot">
        {isOpen ? <X size={24} /> : <MessageCircleMore size={24} />}
      </button>
    </div>
  );
}
