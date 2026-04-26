import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { CalendarDays, Clock, Users, MapPin, Check, Loader2, ArrowRight, Phone, Mail, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { gtagEvent, trackGoogleAdsConversion } from '../utils/gtag';

function AnimatedSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }} className={className}>
      {children}
    </motion.div>
  );
}

const timeSlots = [
  '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
];

function formatDateOnly(value) {
  if (!value) return '';
  const text = String(value);
  const match = text.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : text;
}

export default function Reservations() {
  const { t, i18n } = useTranslation();
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', date: '', time: '', persons: '2', restaurant_id: '', special_requests: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getRestaurants()
      .then((data) => {
        const montrealOnly = (data || []).filter((r) => (
          r?.slug === 'montreal'
          || String(r?.name || '').toLowerCase().includes('montreal')
          || String(r?.city || '').toLowerCase() === 'montreal'
        ));
        setRestaurants(montrealOnly);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (restaurants.length === 1) {
      setForm((prev) => ({ ...prev, restaurant_id: String(restaurants[0].id) }));
    }
  }, [restaurants]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setForm({ ...form, phone: digitsOnly });
      setError('');
      return;
    }

    setForm({ ...form, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.date || !form.time || !form.restaurant_id) {
      setError(t('common.required'));
      return;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      setError(t('common.phone10Digits'));
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        phone: `1${form.phone}`,
        lang: i18n.language,
      };

      const result = await api.createReservation(payload);

      gtagEvent('reservation_submit_success', {
        event_category: 'engagement',
        event_label: 'reservation_form',
        value: Number(form.persons) || 1,
      });

      trackGoogleAdsConversion({
        conversionLabel: process.env.REACT_APP_GOOGLE_ADS_CONVERSION_LABEL,
        value: 1,
        currency: 'USD',
        transactionId: result?.confirmation_code,
      });

      setConfirmation(result);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || t('common.failedReservation'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', date: '', time: '', persons: '2', restaurant_id: '', special_requests: '' });
    setSubmitted(false);
    setConfirmation(null);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen pt-20 relative">
      <div className="indian-mandala-tl" />
      <div className="indian-mandala-br" />

      {/* Hero */}
      <section className="py-20 bg-pattern bg-indian-paisley relative overflow-hidden bg-indian-arch">
        <div className="indian-vine-left" />
        <div className="indian-vine-right" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <AnimatedSection>
            <span className="text-amber-500 dark:text-amber-400 text-sm font-semibold uppercase tracking-wider">{t('reservations.reservations')}</span>
            <div className="section-divider !mx-0" />
            <h1 className="font-display text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white mt-4 mb-4">
              {t('reservations.reserveYour')} <span className="text-gold-gradient">{t('reservations.table')}</span>
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl">
              {t('reservations.heroDesc')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Reservation Form */}
      <section className="py-16 bg-neutral-50 dark:bg-dark-950 bg-indian-jali relative overflow-hidden">
        <div className="indian-vine-left" />
        <div className="indian-vine-right" />
        <div className="max-w-4xl mx-auto px-4">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-neutral-900 border border-green-500/20 rounded-2xl p-10 text-center shadow-sm dark:shadow-none"
              >
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} className="text-green-500 dark:text-green-400" />
                </div>
                <h2 className="font-display text-3xl font-bold text-neutral-900 dark:text-white mb-4">{t('reservations.reservationConfirmed')}</h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                  {t('reservations.tableReserved')}{' '}
                  <span className="text-amber-500 dark:text-amber-400">{confirmation?.email || form.email}</span>.
                </p>

                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-6 max-w-md mx-auto mb-8 text-left space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 text-sm">{t('reservations.confirmationCode')}</span>
                    <span className="text-amber-500 dark:text-amber-400 font-bold">{confirmation?.confirmation_code || 'MAS-XXXXXX'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 text-sm">{t('reservations.name')}</span>
                    <span className="text-neutral-900 dark:text-white text-sm">{confirmation?.name || form.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 text-sm">{t('reservations.date')}</span>
                    <span className="text-neutral-900 dark:text-white text-sm">{formatDateOnly(confirmation?.date || form.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 text-sm">{t('reservations.time')}</span>
                    <span className="text-neutral-900 dark:text-white text-sm">{confirmation?.time || form.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 text-sm">{t('manageReservations.guests')}</span>
                    <span className="text-neutral-900 dark:text-white text-sm">{confirmation?.persons || form.persons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 text-sm">{t('reservations.restaurant')}</span>
                    <span className="text-neutral-900 dark:text-white text-sm">{restaurants.find(r => r.id === parseInt(form.restaurant_id))?.name || '—'}</span>
                  </div>
                </div>

                <button onClick={resetForm} className="btn-gold">
                  {t('reservations.makeAnother')}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 md:p-10 shadow-sm dark:shadow-none">
                  <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white mb-8">
                    {t('reservations.fillDetails')}
                  </h2>

                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 dark:text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-neutral-500 dark:text-neutral-400 text-sm mb-2">{t('reservations.fullName')} *</label>
                      <input type="text" name="name" value={form.name} onChange={handleChange} placeholder={t('reservations.yourNamePlaceholder')} className="input-dark" required />
                    </div>
                    <div>
                      <label className="block text-neutral-500 dark:text-neutral-400 text-sm mb-2">{t('reservations.emailAddress')} *</label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} placeholder={t('reservations.emailPlaceholder')} className="input-dark" required />
                    </div>
                    <div>
                      <label className="block text-neutral-500 dark:text-neutral-400 text-sm mb-2">{t('reservations.phoneNumber')} *</label>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder={t('reservations.phonePlaceholder')} className="input-dark" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} minLength={10} required />
                    </div>
                    <div>
                      <label className="block text-neutral-500 dark:text-neutral-400 text-sm mb-2">{t('reservations.restaurantBranch')} *</label>
                      <select name="restaurant_id" value={form.restaurant_id} onChange={handleChange} className="select-dark" required>
                        <option value="">{t('reservations.selectLocation')}</option>
                        {restaurants.map(r => (
                          <option key={r.id} value={r.id}>{r.name || r.brand} — {r.city}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-neutral-500 dark:text-neutral-400 text-sm mb-2">{t('reservations.dateOfVisit')} *</label>
                      <input type="date" name="date" value={form.date} onChange={handleChange} min={today} className="input-dark" required />
                    </div>
                    <div>
                      <label className="block text-neutral-500 dark:text-neutral-400 text-sm mb-2">{t('reservations.preferredTime')} *</label>
                      <select name="time" value={form.time} onChange={handleChange} className="select-dark" required>
                        <option value="">{t('reservations.selectTime')}</option>
                        {timeSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-neutral-500 dark:text-neutral-400 text-sm mb-2">{t('reservations.numberOfGuests')} *</label>
                      <select name="persons" value={form.persons} onChange={handleChange} className="select-dark" required>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                          <option key={n} value={n}>{n} {n === 1 ? t('reservations.guest') : t('reservations.guests')}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-neutral-500 dark:text-neutral-400 text-sm mb-2">{t('reservations.specialRequests')}</label>
                      <textarea name="special_requests" value={form.special_requests} onChange={handleChange} placeholder={t('reservations.specialRequestsPlaceholder')} rows={3} className="input-dark resize-none" />
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                    <button type="submit" disabled={submitting} className="btn-gold w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed">
                      {submitting ? (
                        <><Loader2 size={18} className="mr-2 animate-spin" /> {t('reservations.booking')}</>
                      ) : (
                        <>{t('reservations.confirmReservation')} <ArrowRight size={18} className="ml-2" /></>
                      )}
                    </button>
                    <p className="text-neutral-400 dark:text-neutral-600 text-xs">
                      {t('reservations.emailConfirmation')}
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info cards */}
          <div className="grid sm:grid-cols-3 gap-6 mt-12">
            {[
              { icon: CalendarDays, titleKey: 'instantConfirmation', descKey: 'instantConfirmationDesc' },
              { icon: Mail, titleKey: 'emailNotification', descKey: 'emailNotificationDesc' },
              { icon: Phone, titleKey: 'needHelp', descKey: 'needHelpDesc' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <AnimatedSection key={item.titleKey} delay={i * 0.1}>
                  <div className="bg-white/80 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 text-center shadow-sm dark:shadow-none">
                    <Icon size={24} className="text-amber-500 dark:text-amber-400 mx-auto mb-3" />
                    <h3 className="text-neutral-900 dark:text-white font-semibold text-sm mb-1">{t(`reservations.${item.titleKey}`)}</h3>
                    <p className="text-neutral-500 text-xs">{t(`reservations.${item.descKey}`)}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
