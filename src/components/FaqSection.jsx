import { useState } from 'react';
import { FAQS } from '../data/menu.js';

function ChevronDown() {
  return (
    <svg className="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function FaqItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  const id = `faq-${index}`;

  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button
        className="faq-question"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={id}
        id={`${id}-btn`}
      >
        {faq.q}
        <ChevronDown />
      </button>
      <div
        className="faq-answer"
        id={id}
        role="region"
        aria-labelledby={`${id}-btn`}
        style={{ maxHeight: open ? '400px' : '0' }}
      >
        <div className="faq-answer-inner">{faq.a}</div>
      </div>
    </div>
  );
}

export default function FaqSection() {
  return (
    <section className="faq-section" aria-labelledby="faq-heading">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">Got Questions?</p>
          <h2 className="section-title" id="faq-heading">Frequently Asked</h2>
          <p className="section-sub">
            Everything you need to know before your first order. Still have questions?{' '}
            <a href="tel:2027345621" className="inline-link">Call us</a>.
          </p>
        </div>

        <dl className="faq-list">
          {FAQS.map((faq, i) => (
            <FaqItem key={i} faq={faq} index={i} />
          ))}
        </dl>
      </div>
    </section>
  );
}
