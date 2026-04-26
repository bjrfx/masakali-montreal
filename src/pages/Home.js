import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, MapPin, Phone, Users, CalendarDays, ChefHat, Sparkles, Clock, PartyPopper } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useLocalizedPath from '../utils/useLocalizedPath';

import imgMonterial1 from '../assets/restaurant-images/monterial1.webp';
import imgMonterial2 from '../assets/restaurant-images/monterial2.webp';
import imgRangde from '../assets/restaurant-images/rangde.webp';
import imgRestobar from '../assets/restaurant-images/re3stobar.webp';
import imgStittsville1 from '../assets/restaurant-images/stittsville1.webp';
import imgStittsville2 from '../assets/restaurant-images/stittsville2.webp';
import imgStittsville3 from '../assets/restaurant-images/stittsville3.webp';
import imgWellington from '../assets/restaurant-images/wellington.webp';
import uberEatsLogo from '../assets/ubereats.png';
import doordashLogo from '../assets/doordash.png';

const heroImages = [
  imgWellington,
  imgStittsville1,
  imgRangde,
  imgRestobar,
  imgMonterial1,
  imgStittsville2,
  imgMonterial2,
  imgStittsville3,
];

const locationSections = [
  {
    countryKey: 'canada',
    locations: [
      {
        name: 'Masakali Indian Cuisine',
        subtitle: 'Masakali Indian Cuisine - Stittsville',
        address: '5507 Hazeldean Rd Unit C3-1, Stittsville, Ontario, Canada',
      },
      {
        name: 'Masakali Indian Cuisine',
        subtitle: 'Masakali Indian Cuisine - Wellington',
        address: '1111 Wellington St. W, Ottawa, ON K1Y 1P1, Ottawa, Ontario, Canada',
      },
      {
        name: 'Masakali Indian Resto Bar',
        subtitle: 'Masakali Indian Resto Bar - Byward Market',
        address: '97 Clarence St., Ottawa, ON K1N 5P9, Ottawa, Ontario, Canada',
      },
      {
        name: 'RangDe Indian Cuisine',
        subtitle: 'RangDe Indian Cuisine - Kanata',
        address: '700 March Rd Unit H, Kanata, ON K2K 2V9, Kanata, Ontario, Canada',
      },
      {
        name: 'Masakali Indian Cuisine',
        subtitle: 'Masakali Indian Cuisine - Montreal',
        address: '1015 Sherbrooke St W, Montreal, Quebec H3A 1G5, Montreal, Quebec, Canada',
      },
    ],
  },
  {
    countryKey: 'usa',
    locations: [
      {
        name: 'Masakali Indian Cuisine',
        subtitle: 'Masakali Indian Cuisine - California',
        address: '10310 S De Anza Blvd, Cupertino, CA 95014, United States, California, USA',
        phone: '(408) 352-5097',
      },
    ],
  },
];

function AnimatedSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function HeroSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {heroImages.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            loading={i < 2 ? 'eager' : 'lazy'}
          />
        </div>
      ))}

      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${i === current ? 'bg-amber-400 w-6' : 'bg-white/30 hover:bg-white/50'
              }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const localePath = useLocalizedPath();

  const stats = [
    { icon: MapPin, value: '6', labelKey: 'statsLocations' },
    { icon: ChefHat, value: '200+', labelKey: 'statsMenuItems' },
    { icon: Users, value: '50K+', labelKey: 'statsReviews' },
    { icon: Sparkles, value: '2026', labelKey: 'statsNowOpen' },
  ];

  return (
    <div className="min-h-screen relative">
      <div className="indian-mandala-tl" />
      <div className="indian-mandala-br" />

      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <HeroSlideshow />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-dark-950/70" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div className="mb-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full grand-opening-badge text-sm">
              <PartyPopper size={16} />
              <span>{t('home.addressBadge')}</span>
              <Sparkles size={14} className="animate-sparkle" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="text-white">{t('home.masakali')}</span>
            <br />
            <span className="text-gold-gradient">{t('home.indianCuisine')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-neutral-300 text-sm sm:text-base md:text-lg mb-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1"
          >
            <Phone size={16} className="text-amber-400 flex-shrink-0" />
            <span>{t('home.callForReservations')}</span>
            <a href="tel:+15142286777" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors">
              (514) 228-6777
            </a>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 px-2"
          >
            <a
              href="https://www.clover.com/online-ordering/masakali-montreal"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-base sm:text-lg !px-6 sm:!px-10 !py-3 sm:!py-4 w-full sm:w-auto text-center"
            >
              {t('home.orderOnlinePickup')} <ArrowRight size={18} className="ml-2" />
            </a>
            <Link to={localePath('/reservations')} className="btn-gold text-base sm:text-lg !px-6 sm:!px-10 !py-3 sm:!py-4 w-full sm:w-auto text-center">
              {t('home.reserveTable')} <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link to={localePath('/menu')} className="btn-outline-gold text-base sm:text-lg !px-6 sm:!px-10 !py-3 sm:!py-4 w-full sm:w-auto text-center">
              {t('home.exploreMenu')}
            </Link>
          </motion.div>



          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="mt-4"
          >
          </motion.div>
        </div>
      </section>

      <section className="py-10 border-b border-neutral-200 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-950/70">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 px-6 py-6 md:px-10 md:py-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <p className="text-amber-600 dark:text-amber-400 text-sm font-semibold uppercase tracking-wider mb-2">{t('home.deliveryPartners')}</p>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                    {t('home.deliveryHeading')}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 flex items-center gap-3">
                    <img src={uberEatsLogo} alt="Uber Eats" className="h-10 w-auto object-contain" loading="lazy" />
                    <span className="text-neutral-700 dark:text-neutral-200 font-medium">Uber Eats</span>
                  </div>
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 flex items-center gap-3">
                    <img src={doordashLogo} alt="DoorDash" className="h-10 w-auto object-contain" loading="lazy" />
                    <span className="text-neutral-700 dark:text-neutral-200 font-medium">DoorDash</span>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="border-y border-neutral-200 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-950/50 bg-indian-jali relative">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <AnimatedSection key={stat.labelKey} delay={i * 0.1} className="text-center">
                  <Icon size={24} className="text-amber-500 dark:text-amber-400 mx-auto mb-3" />
                  <div className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white font-display">{stat.value}</div>
                  <div className="text-neutral-500 text-sm mt-1">{t(`home.${stat.labelKey}`)}</div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-neutral-50 dark:bg-neutral-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <Sparkles size={16} className="text-amber-500" />
              <span className="text-amber-600 dark:text-amber-400 text-sm font-semibold">{t('home.nowOpen')}</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
              {t('home.montrealQuebec')}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-8 max-w-2xl mx-auto">
              {t('home.montrealServing')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={localePath('/reservations')} className="btn-gold text-lg !px-10 !py-4">
                <CalendarDays size={18} className="mr-2" /> {t('home.bookYourTable')}
              </Link>
              <Link to={localePath('/menu')} className="btn-outline-gold text-lg !px-10 !py-4">
                {t('home.previewOurMenu')}
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 bg-neutral-50 dark:bg-neutral-950 relative overflow-hidden border-b border-neutral-200 dark:border-neutral-800/50">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #d97706 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <AnimatedSection className="text-center mb-10">
          <span className="text-amber-500 dark:text-amber-400 text-sm font-semibold uppercase tracking-wider">{t('home.ourBrands')}</span>
          <div className="section-divider" />
        </AnimatedSection>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-neutral-50 dark:from-neutral-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-neutral-50 dark:from-neutral-950 to-transparent z-10 pointer-events-none" />

          <div className="logo-carousel-track">
            {[...Array(8)].map((_, setIdx) => (
              <React.Fragment key={setIdx}>
                <div className="flex-shrink-0 mx-10 md:mx-16 flex items-center justify-center" style={{ minWidth: '200px' }}>
                  <img src="/logo/Masakali-Indian-Cuisine.png" alt="Masakali Indian Cuisine" className="h-24 md:h-28 object-contain opacity-70 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex-shrink-0 mx-10 md:mx-16 flex items-center justify-center" style={{ minWidth: '200px' }}>
                  <img src="/logo/Masakali-RestoBar.png" alt="Masakali Restobar" className="h-20 md:h-24 object-contain opacity-70 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex-shrink-0 mx-10 md:mx-16 flex items-center justify-center" style={{ minWidth: '200px' }}>
                  <img src="/logo/RangDe-Indian-Cuisine.png" alt="RangDe Indian Cuisine" className="h-36 md:h-34 object-contain opacity-70 hover:opacity-100 transition-opacity duration-300" />
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <style>{`
          .logo-carousel-track {
            display: flex;
            align-items: center;
            width: max-content;
            animation: logoScroll 30s linear infinite;
          }
          @keyframes logoScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      <section className="py-24 bg-pattern bg-section-indian relative overflow-hidden">
        <div className="indian-vine-left" />
        <div className="indian-vine-right" />
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mt-4">
              {t('home.ourLocations')} <span className="text-gold-gradient">{t('home.locations')}</span>
            </h2>
          </AnimatedSection>

          <div className="space-y-12">
            {locationSections.map((section, sectionIndex) => (
              <div key={section.countryKey}>
                <AnimatedSection delay={sectionIndex * 0.1} className="flex items-center gap-4 mb-5">
                  <h3 className="font-display text-3xl font-bold text-neutral-900 dark:text-white">{t(`home.${section.countryKey}`)}</h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                    {section.locations.length} {section.locations.length === 1 ? t('home.location') : t('home.locations')}
                  </span>
                </AnimatedSection>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.locations.map((loc, i) => (
                    <AnimatedSection key={`${section.countryKey}-${i}`} delay={Math.min(i * 0.05, 0.2)}>
                      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/70 p-6 shadow-sm dark:shadow-none min-h-[165px]">
                        <div className="flex items-start gap-3">
                          <MapPin size={20} className="text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-neutral-900 dark:text-white font-semibold text-3 leading-tight">{loc.name}</p>
                            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">{loc.subtitle}</p>
                            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-3 leading-relaxed">{loc.address}</p>
                            {loc.phone && (
                              <a href={`tel:${loc.phone}`} className="inline-flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-sm mt-3 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                                <Phone size={14} />
                                <span>{loc.phone}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </AnimatedSection>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <AnimatedSection className="text-center mt-12">
            <Link to={localePath('/locations')} className="btn-outline-gold">
              {t('home.viewAllLocations')} <ArrowRight size={16} className="ml-2" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-24 bg-neutral-50 dark:bg-neutral-950 relative overflow-hidden bg-indian-jali">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center">
            <span className="text-amber-500 dark:text-amber-400 text-sm font-semibold uppercase tracking-wider">{t('home.reserveNow')}</span>
            <div className="section-divider" />
            <h2 className="font-display text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mt-4 mb-6">
              {t('home.bookYourExperience')} <span className="text-gold-gradient">{t('home.experience')}</span>
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-10 max-w-2xl mx-auto">
              {t('home.experienceDesc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={localePath('/reservations')} className="btn-gold text-lg !px-10 !py-4">
                <CalendarDays size={20} className="mr-2" /> {t('home.reserveATable')}
              </Link>
              <Link to={localePath('/catering')} className="btn-outline-gold text-lg !px-10 !py-4">
                <Users size={20} className="mr-2" /> {t('home.cateringServices')}
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-amber-100/50 dark:from-amber-900/20 via-neutral-50 dark:via-neutral-950 to-amber-100/50 dark:to-amber-900/20 border-y border-amber-500/10 bg-indian-lotus relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              {t('home.planningEvent')}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-8">
              {t('home.planningEventDesc')}
            </p>
            <Link to={localePath('/catering')} className="btn-gold text-lg">
              {t('home.exploreCatering')} <ArrowRight size={18} className="ml-2" />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
