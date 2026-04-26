import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Check, Loader2, ArrowRight, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api';

function AnimatedSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }} className={className}>
      {children}
    </motion.div>
  );
}

const subjectKeys = [
  { value: 'reservation', key: 'reservationInquiry' },
  { value: 'feedback', key: 'feedback' },
  { value: 'catering', key: 'cateringSubject' },
  { value: 'general', key: 'generalQuestion' },
  { value: 'complaint', key: 'complaint' },
  { value: 'other', key: 'other' },
];

export default function Contact() {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

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
    if (!form.name || !form.email || !form.message) {
      setError(t('common.required'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        phone: form.phone ? `1${form.phone}` : '',
        lang: i18n.language,
      };
      await api.submitContact(payload);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || t('common.failedSend'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    setSubmitted(false);
    setError('');
  };

  const contactCards = [
    { icon: MapPin, titleKey: 'ourLocation', lines: ['1015 Sherbrooke St W', 'Montreal, QC H3A 1G5, Canada'] },
    { icon: Phone, titleKey: 'phone', lines: ['(514) 228-6777'] },
    { icon: Mail, titleKey: 'email', lines: ['masakalimontreal@gmail.com'] },
    { icon: Clock, titleKey: 'hours', lines: [t('contact.hoursLine1'), t('contact.hoursLine2')] },
  ];

  return (
    <div className="min-h-screen pt-20 relative">
      <div className="indian-mandala-tl" /><div className="indian-mandala-br" />

      {/* Hero */}
      <section className="py-20 bg-pattern bg-indian-paisley relative overflow-hidden bg-indian-arch">
        <div className="indian-vine-left" /><div className="indian-vine-right" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <AnimatedSection>
            <span className="text-amber-500 dark:text-amber-400 text-sm font-semibold uppercase tracking-wider">{t('contact.contactUs')}</span>
            <div className="section-divider !mx-0" />
            <h1 className="font-display text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white mt-4 mb-4">{t('contact.getIn')} <span className="text-gold-gradient">{t('contact.touch')}</span></h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl">{t('contact.heroDesc')}</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-neutral-50 dark:bg-dark-950 bg-indian-jali relative overflow-hidden">
        <div className="indian-vine-left" /><div className="indian-vine-right" />
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactCards.map((item, i) => {
              const Icon = item.icon;
              return (
                <AnimatedSection key={item.titleKey} delay={i * 0.1}>
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm dark:shadow-none h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={20} className="text-amber-500 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-neutral-900 dark:text-white font-semibold text-sm mb-1">{t(`contact.${item.titleKey}`)}</h3>
                        {item.lines.map((line, j) => <p key={j} className="text-neutral-500 text-sm">{line}</p>)}
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-white dark:bg-neutral-950 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-neutral-900 border border-green-500/20 rounded-2xl p-10 text-center shadow-sm dark:shadow-none"
              >
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} className="text-green-500 dark:text-green-400" />
                </div>
                <h2 className="font-display text-3xl font-bold text-neutral-900 dark:text-white mb-4">{t('contact.messageSent')}</h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                  {t('contact.thankYou')}
                </p>
                <button onClick={resetForm} className="btn-gold">{t('contact.sendAnother')}</button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 md:p-10 shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageSquare size={24} className="text-amber-500 dark:text-amber-400" />
                    <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">{t('contact.sendUsMessage')}</h2>
                  </div>
                  <p className="text-neutral-500 text-sm mb-8">{t('contact.formDesc')}</p>

                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 dark:text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-neutral-500 dark:text-neutral-400 text-sm mb-2">{t('contact.fullName')} *</label>
                      <input type="text" name="name" value={form.name} onChange={handleChange} placeholder={t('contact.yourNamePlaceholder')} className="input-dark" required />
                    </div>
                    <div>
                      <label className="block text-neutral-500 dark:text-neutral-400 text-sm mb-2">{t('contact.emailAddress')} *</label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} placeholder={t('contact.emailPlaceholder')} className="input-dark" required />
                    </div>
                    <div>
                      <label className="block text-neutral-500 dark:text-neutral-400 text-sm mb-2">{t('contact.phoneNumber')}</label>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder={t('contact.phonePlaceholder')} className="input-dark" inputMode="numeric" maxLength={10} />
                    </div>
                    <div>
                      <label className="block text-neutral-500 dark:text-neutral-400 text-sm mb-2">{t('contact.subject')}</label>
                      <select name="subject" value={form.subject} onChange={handleChange} className="select-dark">
                        <option value="">{t('contact.selectSubject')}</option>
                        {subjectKeys.map(opt => (
                          <option key={opt.value} value={opt.value}>{t(`contact.${opt.key}`)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-neutral-500 dark:text-neutral-400 text-sm mb-2">{t('contact.message')} *</label>
                      <textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder={t('contact.messagePlaceholder')} className="input-dark resize-none" required />
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                    <button type="submit" disabled={submitting} className="btn-gold w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed">
                      {submitting ? (
                        <><Loader2 size={18} className="mr-2 animate-spin" /> {t('contact.sending')}</>
                      ) : (
                        <>{t('contact.sendMessage')} <ArrowRight size={18} className="ml-2" /></>
                      )}
                    </button>
                    <p className="text-neutral-400 dark:text-neutral-600 text-xs">
                      {t('contact.respondTime')}
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
