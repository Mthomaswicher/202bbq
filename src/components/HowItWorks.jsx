import { SITE, PICKUP_AREA, DELIVERY_FEE_SENTENCE } from '../data/site.js';
import { useOrderWindow } from './StatusLine.jsx';
import { nowET } from '../lib/time.js';
import { Section, PhoneLink } from './ui/Bits.jsx';

const WEEK = [
  { d: 'Mon', label: 'Order' },
  { d: 'Tue', label: 'Order' },
  { d: 'Wed', label: 'Order' },
  { d: 'Thu', label: 'Order by 9 pm' },
  { d: 'Fri', label: 'We smoke overnight' },
  { d: 'Sat', label: 'Pickup or delivery' },
  { d: 'Sun', label: 'Pickup or delivery' },
];
const DOW_TO_INDEX = [6, 0, 1, 2, 3, 4, 5]; // JS Sunday=0 → our Mon-first index

function WeekStrip() {
  const today = DOW_TO_INDEX[nowET().dow];
  return (
    <ol className="weekstrip band" aria-label="Our week">
      {WEEK.map((w, i) => (
        <li key={w.d} className={i === today ? 'is-today' : undefined} aria-current={i === today ? 'date' : undefined}>
          <span className="mono weekstrip-day">{w.d}</span>
          <span className="weekstrip-label">{w.label}</span>
          {i === today && <span className="sr-only">(today)</span>}
        </li>
      ))}
    </ol>
  );
}

export default function HowItWorks() {
  const win = useOrderWindow();
  return (
    <Section id="how-it-works" title="How ordering works" className="how">
      <WeekStrip />
      <ol className="steps">
        <li>
          <span className="step-num" aria-hidden="true">1</span>
          <div>
            <h3 className="step-title">Pick your trays.</h3>
            <p>A full tray feeds 30–40, a half feeds 15–20. Not sure how much? Use the <a href="#menu">headcount helper</a>, or call <PhoneLink location="how" />.</p>
          </div>
        </li>
        <li>
          <span className="step-num" aria-hidden="true">2</span>
          <div>
            <h3 className="step-title">Send your request by Thursday {win.cutoffLabel}.</h3>
            <p>Nothing is charged automatically. {SITE.owner} calls or emails to confirm, usually within a few hours, and quotes any market-price items.</p>
          </div>
        </li>
        <li>
          <span className="step-num" aria-hidden="true">3</span>
          <div>
            <h3 className="step-title">Hold it with a ${SITE.depositAmount} deposit — now, or after {SITE.owner} confirms.</h3>
            <p>Card, Apple Pay or Google Pay through Stripe, or Cash App, Venmo or Zelle. Refunded in full if we can’t fill your request. The balance is due at pickup or delivery.</p>
          </div>
        </li>
        <li>
          <span className="step-num" aria-hidden="true">4</span>
          <div>
            <h3 className="step-title">Saturday or Sunday, {SITE.fulfilHours.open}–{SITE.fulfilHours.close}.</h3>
            <p>Free pickup in {PICKUP_AREA}. Delivery across {SITE.serviceArea} — {DELIVERY_FEE_SENTENCE}.</p>
          </div>
        </li>
      </ol>
    </Section>
  );
}
