import { useState } from 'react';
import { FAQS } from '../data/faqs.js';
import { SITE } from '../data/site.js';
import Icon from './ui/Icon.jsx';
import { Section, PhoneLink } from './ui/Bits.jsx';

function FaqItem({ faq, open, onToggle }) {
  const panelId = `faq-${faq.id}`;
  return (
    <li className={`faq-item${open ? ' is-open' : ''}`}>
      <h3 className="faq-q">
        <button type="button" aria-expanded={open} aria-controls={panelId} id={`${panelId}-btn`} onClick={onToggle}>
          <span>{faq.q}</span>
          <Icon name="chevronDown" size={24} />
        </button>
      </h3>
      <div className="faq-answer" id={panelId} hidden={!open}>
        <div className="faq-answer-inner prose">
          <p>{faq.a}</p>
          <p className="faq-sig">— {SITE.owner}</p>
        </div>
      </div>
    </li>
  );
}

export default function FaqSection() {
  const [openId, setOpenId] = useState(FAQS[0]?.id ?? null);
  return (
    <Section id="faq" title="Questions" className="faq" grid
      lede={<>Still wondering? Call <PhoneLink location="faq" /> — a real person answers.</>}>
      <ul className="faq-list">
        {FAQS.map(f => <FaqItem key={f.id} faq={f} open={openId === f.id} onToggle={() => setOpenId(openId === f.id ? null : f.id)} />)}
      </ul>
    </Section>
  );
}
