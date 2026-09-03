import { useRef, useState } from 'react';
import reviews from '../data/reviews.json';
import { SITE } from '../data/site.js';
import { useCart } from '../context/CartContext.jsx';
import { stampET } from '../lib/time.js';
import { submitToFormspree } from '../lib/formspree.js';
import { track } from '../lib/analytics.js';
import { TextField, TextArea, RadioCardGroup, ErrorSummary, Notice } from './ui/Field.jsx';
import Button from './ui/Button.jsx';
import Icon from './ui/Icon.jsx';
import { Section, Stars } from './ui/Bits.jsx';

const RATINGS = [1, 2, 3, 4, 5].map(n => ({ value: String(n), title: `${n} — ${['Poor', 'Fair', 'Good', 'Very good', 'Excellent'][n - 1]}` }));

function ReviewQuote({ r }) {
  const when = new Date(`${r.date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  return (
    <li className="review">
      <Stars rating={r.rating} />
      <blockquote><p>{r.text}</p></blockquote>
      <p className="review-by">— {r.name}, Washington, DC · <time dateTime={r.date}>{when}</time></p>
    </li>
  );
}

function ReviewForm() {
  const { customer, setCustomer } = useCart();
  const [rating, setRating] = useState('');
  const [text, setText] = useState('');
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [done, setDone] = useState(false);
  const summaryRef = useRef(null);

  const onSubmit = async ev => {
    ev.preventDefault();
    const e = {};
    if (!customer.name.trim()) e['rv-name'] = 'Enter your name as you\'d like it shown.';
    if (!rating) e['rv-rating'] = 'Choose a star rating.';
    if (text.trim().length < 10) e['rv-text'] = 'Write a sentence or two about what you ordered.';
    setErrors(e); setSendError('');
    if (Object.keys(e).length) { setTimeout(() => summaryRef.current?.focus(), 0); return; }
    setSending(true);
    const result = await submitToFormspree(SITE.forms.reviews, {
      _subject: `New review from ${customer.name.trim()} (${rating}★)`,
      _gotcha: ev.target.elements._gotcha?.value ?? '',
      name: customer.name.trim(),
      Rating: `${rating} of 5`,
      Review: text.trim(),
      'Submitted (ET)': stampET(),
    });
    setSending(false);
    if (!result.ok) { setSendError(result.error); return; }
    track('submit_review', { rating: Number(rating) });
    setDone(true);
  };

  if (done) return <p className="form-done" tabIndex={-1}>Thank you — {SITE.owner} reads every review and posts them here once he's checked them.</p>;
  return (
    <form className="review-form" noValidate onSubmit={onSubmit}>
      <ErrorSummary errors={Object.entries(errors).map(([id, message]) => ({ id, message }))} summaryRef={summaryRef} />
      <TextField id="rv-name" name="name" label="Your name" autoComplete="name" value={customer.name} onChange={v => setCustomer({ name: v })} error={errors['rv-name']} hint='Shown with your review, like "Sam F."' />
      <RadioCardGroup id="rv-rating" name="rating" legend="Your rating" value={rating} onChange={setRating} options={RATINGS} chips error={errors['rv-rating']} />
      <TextArea id="rv-text" name="review" label="Your review" value={text} onChange={setText} error={errors['rv-text']} maxLength={600} hint="What did you order? How was it?" />
      <input type="text" name="_gotcha" className="gotcha" tabIndex={-1} aria-hidden="true" autoComplete="off" defaultValue="" />
      {sendError && <Notice kind="error" role="alert">{sendError}</Notice>}
      <Button type="submit" busy={sending}>Post your review</Button>
    </form>
  );
}

export default function ReviewsSection() {
  const n = reviews.length;
  const avg = n ? reviews.reduce((s, r) => s + r.rating, 0) / n : 0;
  const sorted = [...reviews].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Section id="reviews" title="What customers say" className="reviews"
      lede={n ? `${avg.toFixed(1)} out of 5 from ${n} customers. Every review is from someone who ordered.` : 'Every review here is from someone who ordered.'}>
      <ul className="review-grid">
        {sorted.map(r => <ReviewQuote key={r.id} r={r} />)}
      </ul>
      <details className="disclosure review-disclosure">
        <summary className="btn btn-secondary"><Icon name="chevronDown" size={22} /> Leave a review</summary>
        <ReviewForm />
      </details>
    </Section>
  );
}
