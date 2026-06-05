import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api';

const knownBannerTexts = [
  'JOIN OUR TEAM: NOW HIRING ✨ Masakali Montreal Now Open! ✨',
  'JOIN OUR TEAM: NOW HIRING @Masakali Montreal',
];

function normalizeCopy(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function translateHiringApiError(message, t) {
  const normalized = normalizeCopy(message);
  const mapped = {
    'Only PDF, DOC, or DOCX files are allowed': 'hiringBanner.errors.resumeType',
    'Only PDF, DOC, and DOCX files are allowed': 'hiringBanner.errors.resumeType',
    'Resume must be under 5MB': 'hiringBanner.errors.resumeSize',
    'Full name, phone number, and email are required': 'hiringBanner.errors.requiredFields',
    'Please provide a valid email address': 'hiringBanner.errors.emailInvalid',
    'Please provide a valid phone number': 'hiringBanner.errors.phoneInvalid',
    'Failed to submit application': 'hiringBanner.errors.submitFailed',
  };

  return mapped[normalized] ? t(mapped[normalized]) : (message || t('hiringBanner.errors.generic'));
}

export default function HiringBanner() {
  const { t } = useTranslation();
  const [banner, setBanner] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone_number: '', email: '' });
  const [resumeFile, setResumeFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef(null);

  const localizedBannerText = banner && knownBannerTexts.includes(normalizeCopy(banner.banner_text))
    ? t('hiringBanner.bannerText')
    : banner?.banner_text;
  const localizedBannerCta = banner && normalizeCopy(banner.cta_text) === 'Apply Now'
    ? t('hiringBanner.applyNow')
    : banner?.cta_text;

  useEffect(() => {
    // Check if banner was previously dismissed in this session
    const wasDismissed = sessionStorage.getItem('hiringBannerDismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    const loadBanner = async () => {
      try {
        const data = await api.getHiringBanner();
        if (data && data.is_enabled) {
          setBanner(data);
        }
      } catch (err) {
        console.error('Failed to load hiring banner:', err);
      }
    };
    loadBanner();
  }, []);

  // Manage body class for navbar offset
  useEffect(() => {
    if (banner && !dismissed) {
      document.body.classList.add('hiring-banner-active');
    } else {
      document.body.classList.remove('hiring-banner-active');
    }
    return () => document.body.classList.remove('hiring-banner-active');
  }, [banner, dismissed]);

  const handleDismiss = (e) => {
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem('hiringBannerDismissed', 'true');
  };

  const handleBannerClick = () => {
    setShowModal(true);
    setSubmitted(false);
    setSubmitError('');
    setErrors({});
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.full_name.trim()) errs.full_name = t('hiringBanner.errors.fullNameRequired');
    if (!formData.phone_number.trim()) {
      errs.phone_number = t('hiringBanner.errors.phoneRequired');
    } else {
      const digits = formData.phone_number.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) errs.phone_number = t('hiringBanner.errors.phoneInvalid');
    }
    if (!formData.email.trim()) {
      errs.email = t('hiringBanner.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = t('hiringBanner.errors.emailInvalid');
    }
    if (resumeFile) {
      const ext = resumeFile.name.split('.').pop().toLowerCase();
      if (!['pdf', 'doc', 'docx'].includes(ext)) {
        errs.resume = t('hiringBanner.errors.resumeType');
      } else if (resumeFile.size > 5 * 1024 * 1024) {
        errs.resume = t('hiringBanner.errors.resumeSize');
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const data = new FormData();
      data.append('full_name', formData.full_name.trim());
      data.append('phone_number', formData.phone_number.trim());
      data.append('email', formData.email.trim().toLowerCase());
      if (resumeFile) data.append('resume', resumeFile);

      await api.submitHiringApplication(data);
      setSubmitted(true);
      setFormData({ full_name: '', phone_number: '', email: '' });
      setResumeFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Auto-close modal after success
      setTimeout(() => {
        setShowModal(false);
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      setSubmitError(translateHiringApiError(err.message, t));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setResumeFile(file);
    if (errors.resume) {
      setErrors((prev) => ({ ...prev, resume: '' }));
    }
  };

  if (!banner || dismissed) return null;

  return (
    <>
      {/* Hiring Banner */}
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="hiring-banner"
            onClick={handleBannerClick}
            role="banner"
            aria-label={t('hiringBanner.aria.banner')}
          >
            <div className="hiring-banner-inner">
              <div className="hiring-banner-content">
                <span className="hiring-banner-text">
                  {localizedBannerText}
                </span>
                <span className="hiring-banner-cta">
                  {localizedBannerCta || t('hiringBanner.applyNow')}
                  <ChevronRight size={14} className="inline-block ml-1" />
                </span>
              </div>
              <button
                className="hiring-banner-close"
                onClick={handleDismiss}
                aria-label={t('hiringBanner.aria.dismissBanner')}
              >
                <X size={16} />
              </button>
            </div>
            {/* Shimmer effect overlay */}
            <div className="hiring-banner-shimmer" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Application Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hiring-modal-overlay"
            onClick={() => !submitting && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="hiring-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="hiring-modal-header">
                <div>
                  <h2 className="hiring-modal-title">{t('hiringBanner.modal.title')}</h2>
                  <p className="hiring-modal-subtitle">{t('hiringBanner.modal.subtitle')}</p>
                </div>
                <button
                  className="hiring-modal-close"
                  onClick={() => !submitting && setShowModal(false)}
                  aria-label={t('hiringBanner.aria.closeForm')}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Success State */}
              {submitted ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="hiring-modal-success"
                >
                  <div className="hiring-success-icon">
                    <CheckCircle size={48} />
                  </div>
                  <h3>{t('hiringBanner.success.title')}</h3>
                  <p>{t('hiringBanner.success.description')}</p>
                </motion.div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="hiring-modal-form">
                  {submitError && (
                    <div className="hiring-form-error">
                      <AlertCircle size={16} />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="hiring-form-group">
                    <label htmlFor="hiring-name" className="hiring-form-label">
                      {t('hiringBanner.form.fullName')} <span className="hiring-required">*</span>
                    </label>
                    <input
                      id="hiring-name"
                      type="text"
                      className={`hiring-form-input ${errors.full_name ? 'hiring-input-error' : ''}`}
                      placeholder={t('hiringBanner.form.fullNamePlaceholder')}
                      value={formData.full_name}
                      onChange={(e) => {
                        setFormData({ ...formData, full_name: e.target.value });
                        if (errors.full_name) setErrors((prev) => ({ ...prev, full_name: '' }));
                      }}
                      disabled={submitting}
                    />
                    {errors.full_name && <span className="hiring-error-text">{errors.full_name}</span>}
                  </div>

                  {/* Phone Number */}
                  <div className="hiring-form-group">
                    <label htmlFor="hiring-phone" className="hiring-form-label">
                      {t('hiringBanner.form.phoneNumber')} <span className="hiring-required">*</span>
                    </label>
                    <input
                      id="hiring-phone"
                      type="tel"
                      className={`hiring-form-input ${errors.phone_number ? 'hiring-input-error' : ''}`}
                      placeholder="(408) 555-1234"
                      value={formData.phone_number}
                      onChange={(e) => {
                        setFormData({ ...formData, phone_number: e.target.value });
                        if (errors.phone_number) setErrors((prev) => ({ ...prev, phone_number: '' }));
                      }}
                      disabled={submitting}
                    />
                    {errors.phone_number && <span className="hiring-error-text">{errors.phone_number}</span>}
                  </div>

                  {/* Email */}
                  <div className="hiring-form-group">
                    <label htmlFor="hiring-email" className="hiring-form-label">
                      {t('hiringBanner.form.emailAddress')} <span className="hiring-required">*</span>
                    </label>
                    <input
                      id="hiring-email"
                      type="email"
                      className={`hiring-form-input ${errors.email ? 'hiring-input-error' : ''}`}
                      placeholder={t('hiringBanner.form.emailPlaceholder')}
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      disabled={submitting}
                    />
                    {errors.email && <span className="hiring-error-text">{errors.email}</span>}
                  </div>

                  {/* Resume Upload */}
                  <div className="hiring-form-group">
                    <label htmlFor="hiring-resume" className="hiring-form-label">
                      {t('hiringBanner.form.resume')} <span className="hiring-optional">({t('hiringBanner.form.optional')})</span>
                    </label>
                    <div
                      className={`hiring-file-upload ${errors.resume ? 'hiring-input-error' : ''}`}
                      onClick={() => !submitting && fileInputRef.current?.click()}
                    >
                      <Upload size={20} className="hiring-upload-icon" />
                      {resumeFile ? (
                        <span className="hiring-file-name">{resumeFile.name}</span>
                      ) : (
                        <span className="hiring-file-placeholder">{t('hiringBanner.form.resumePlaceholder')}</span>
                      )}
                    </div>
                    <input
                      id="hiring-resume"
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={submitting}
                    />
                    {errors.resume && <span className="hiring-error-text">{errors.resume}</span>}
                  </div>

                  {/* Buttons */}
                  <div className="hiring-form-actions">
                    <button
                      type="button"
                      className="hiring-btn-cancel"
                      onClick={() => setShowModal(false)}
                      disabled={submitting}
                    >
                      {t('hiringBanner.form.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="hiring-btn-submit"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>{t('hiringBanner.form.submitting')}</span>
                        </>
                      ) : (
                        t('hiringBanner.form.submit')
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
