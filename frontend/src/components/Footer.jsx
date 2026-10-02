import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'princeblessed48@gmail.com';
const supportPhone = import.meta.env.VITE_SUPPORT_PHONE || '+2348148282468';
const supportPhoneLabel = import.meta.env.VITE_SUPPORT_PHONE_LABEL || '(+234) 814 828 2468';
const supportLocation = import.meta.env.VITE_SUPPORT_LOCATION || '';
const supportMapUrl = import.meta.env.VITE_SUPPORT_MAP_URL || '';
const supportHours = import.meta.env.VITE_SUPPORT_HOURS || '';
const CURRENT_YEAR = new Date().getFullYear();

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 360);
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  const scrollToTop = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  if (!visible) return null;

  return <button className="back-to-top" type="button" onClick={scrollToTop} aria-label="Back to top" title="Back to top"><span aria-hidden="true">↑</span></button>;
}

export default function Footer({ user, isSubscriber }) {
  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="footer-main">
        <section className="footer-brand-column" aria-labelledby="footer-brand-title">
          <Link to="/" className="footer-brand-lockup">
            <img src="/bk-mark.svg" alt="" width="46" height="46" />
            <span id="footer-brand-title">Bachelor Kitchen</span>
          </Link>
          <p>Making everyday cooking easier with practical recipes, monthly meal plans and convenient food solutions designed for modern living.</p>
          <strong className="footer-tagline">Plan Better. Cook Smarter. Eat Better.</strong>
        </section>

        <nav className="footer-nav-column" aria-labelledby="footer-nav-title">
          <h2 id="footer-nav-title">Explore</h2>
          <Link to="/">Home</Link>
          <Link to="/meals">Explore meals</Link>
          <Link to="/meal-plan">Monthly timetable</Link>
          <Link to="/about">About us</Link>
          <a href={`mailto:${supportEmail}`}>Contact us</a>
        </nav>

        <section className="footer-contact-column" aria-labelledby="footer-contact-title">
          <h2 id="footer-contact-title">Contact</h2>
          {supportEmail ? <a href={`mailto:${supportEmail}`}><span aria-hidden="true">✉</span><span>{supportEmail}</span></a> : null}
          {supportPhone ? <a href={`tel:${supportPhone}`}><span aria-hidden="true">☎</span><span>{supportPhoneLabel}</span></a> : null}
          {supportLocation ? <p className="footer-location"><span aria-hidden="true">⌖</span>{supportMapUrl ? <a href={supportMapUrl} target="_blank" rel="noreferrer">{supportLocation}</a> : supportLocation}</p> : null}
          {supportHours ? <p className="footer-hours">Support hours: {supportHours}</p> : null}
        </section>

        <section className="footer-subscription-column" aria-labelledby="footer-subscription-title">
          <span className="footer-kicker">For your everyday table</span>
          <h2 id="footer-subscription-title">Unlock the full Bachelor Kitchen experience</h2>
          <p>Get the complete monthly plan, nutrition, cooking guides, serving recommendations and subscriber benefits.</p>
          {isSubscriber && user ? <Link className="footer-cta" to="/billing">Manage subscription <span aria-hidden="true">→</span></Link> : <Link className="footer-cta" to="/plans">View subscription plans <span aria-hidden="true">→</span></Link>}
        </section>
      </div>

      <div className="footer-bottom">
        <p>© {CURRENT_YEAR} Bachelor Kitchen. All rights reserved.</p>
        <p className="footer-made-for">Made for real kitchens, every day.</p>
      </div>
      <BackToTop />
    </footer>
  );
}