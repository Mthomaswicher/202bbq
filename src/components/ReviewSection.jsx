import { useState, useMemo } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { track } from '../lib/analytics.js';
import REVIEWS from '../data/reviews.json';

function Stars({ value, size = 'md' }) {
  const full = Math.round(value);
  return (
    <span className={`stars stars-${size}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= full ? 'star-fill' : 'star-empty'} aria-hidden="true">★</span>
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="star-picker" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`star-btn${n <= display ? ' active' : ''}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${n} star${n !== 1 ? 's' : ''}`}
          aria-pressed={value === n}
        >
          ★
        </button>
      ))}
      {value > 0 && (
        <span className="star-label" aria-live="polite">
          {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][value]}
        </span>
      )}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function ReviewCard({ review }) {
  return (
    <article className="review-card" itemScope itemType="https://schema.org/Review">
      <header className="review-card-head">
        <div>
          <div className="review-card-name" itemProp="author" itemScope itemType="https://schema.org/Person">
            <span itemProp="name">{review.name}</span>
          </div>
          {review.location && <div className="review-card-loc">{review.location}</div>}
        </div>
        <Stars value={review.rating} size="sm" />
      </header>
      <p className="review-card-text" itemProp="reviewBody">"{review.text}"</p>
      <footer className="review-card-foot">
        {review.date && (
          <time dateTime={review.date} itemProp="datePublished">{formatDate(review.date)}</time>
        )}
        {review.source === 'google' && <span className="review-card-badge">via Google</span>}
        {review.source === 'instagram' && <span className="review-card-badge">via Instagram</span>}
      </footer>
      <meta itemProp="reviewRating" content={review.rating} />
    </article>
  );
}

function ReviewsJsonLd({ reviews, avg }) {
  if (!reviews.length) return null;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': 'https://202barbecue.com/#restaurant',
    name: '202BBQ',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avg.toFixed(1),
      reviewCount: reviews.length,
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.map(r => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.name },
      datePublished: r.date,
      reviewBody: r.text,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: '5',
        worstRating: '1',
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function ReviewSection() {
  const { addToast } = useToast();

  const [fields, setFields]       = useState({ name: '', review: '' });
  const [rating, setRating]       = useState(0);
  const [errors, setErrors]       = useState({});
  const [touched, setTouched]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const avgRating = useMemo(() => {
    if (!REVIEWS.length) return 0;
    return REVIEWS.reduce((s, r) => s + (r.rating || 0), 0) / REVIEWS.length;
  }, []);

  const set = (key, val) => {
    setFields(f => ({ ...f, [key]: val }));
    if (touched[key]) validate(key, val);
  };

  const validate = (key, val = fields[key]) => {
    const msg = !val.trim() ? 'This field is required.' : '';
    setErrors(e => ({ ...e, [key]: msg }));
    return !msg;
  };

  const blur = (key) => {
    setTouched(t => ({ ...t, [key]: true }));
    validate(key);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameOk   = validate('name');
    const reviewOk = validate('review');
    setTouched({ name: true, review: true });

    if (!rating)    { addToast('Please choose a star rating.', 'error'); return; }
    if (!nameOk || !reviewOk) return;

    setSubmitting(true);

    const formspreePayload = {
      _subject: `New Review — ${fields.name.trim()} (${rating}★)`,
      Name:      fields.name.trim(),
      Rating:    `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)`,
      Review:    fields.review.trim(),
      Submitted: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
    };

    const endpoint = import.meta.env.VITE_FORMSPREE_REVIEWS;

    if (!endpoint || endpoint.includes('REPLACE_ME')) {
      console.log('202BBQ Review (Formspree not configured):', formspreePayload);
      await new Promise(r => setTimeout(r, 800));
    } else {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formspreePayload),
      });
      if (!res.ok) {
        setSubmitting(false);
        addToast('Something went wrong. Please try again.', 'error');
        return;
      }
    }

    track('submit_review', { rating });

    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section className="review-section" aria-labelledby="review-heading">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">Spread the Smoke</p>
          <h2 className="section-title" id="review-heading">What Folks Are Saying</h2>
          <p className="section-sub">
            Real words from real customers across DC and the DMV. Had 202BBQ yourself? Leave a review below.
          </p>
        </div>

        {REVIEWS.length > 0 && (
          <>
            <ReviewsJsonLd reviews={REVIEWS} avg={avgRating} />
            <div className="review-summary" role="group" aria-label="Customer rating summary">
              <div className="review-summary-rating">
                <span className="review-summary-score">{avgRating.toFixed(1)}</span>
                <Stars value={avgRating} size="md" />
              </div>
              <p className="review-summary-count">
                Based on {REVIEWS.length} customer review{REVIEWS.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="review-grid">
              {REVIEWS.map(r => <ReviewCard key={r.id} review={r} />)}
            </div>
          </>
        )}

        <div className="review-layout">
          {/* Left: why it matters */}
          <div className="review-why">
            <div className="review-why-item">
              <span className="review-why-icon" aria-hidden="true">🔥</span>
              <div>
                <strong>Real feedback only</strong>
                <p>We don't manufacture reviews. Every word here comes from a real customer.</p>
              </div>
            </div>
            <div className="review-why-item">
              <span className="review-why-icon" aria-hidden="true">🏙️</span>
              <div>
                <strong>Help DC find us</strong>
                <p>We're a small operation. Word of mouth is everything.</p>
              </div>
            </div>
            <div className="review-why-item">
              <span className="review-why-icon" aria-hidden="true">📣</span>
              <div>
                <strong>Tag us on Instagram</strong>
                <p>
                  Post a photo and tag{' '}
                  <a href="https://www.instagram.com/202_bbq" target="_blank" rel="noopener noreferrer" className="inline-link">
                    @202_bbq
                  </a>
                  {' '}— we share our favorites.
                </p>
              </div>
            </div>
          </div>

          {/* Right: form or success */}
          <div className="review-form-wrap">
            {submitted ? (
              <div className="review-success" role="status" aria-live="polite">
                <div className="review-success-icon" aria-hidden="true">🙏</div>
                <h3>Thank you!</h3>
                <p>We'll read it and post the best ones on the site. Your review means a lot.</p>
                <button
                  className="btn btn-ghost"
                  onClick={() => { setSubmitted(false); setFields({ name: '', review: '' }); setRating(0); setTouched({}); }}
                >
                  Leave another review
                </button>
              </div>
            ) : (
              <form
                className="review-form"
                onSubmit={handleSubmit}
                noValidate
                aria-label="Customer review form"
              >
                {/* Star rating */}
                <div className="form-group">
                  <label>
                    Your Rating <span className="req" aria-hidden="true">*</span>
                  </label>
                  <StarPicker value={rating} onChange={setRating} />
                </div>

                {/* Name */}
                <div className="form-group">
                  <label htmlFor="rv-name">
                    Your Name <span className="req" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text"
                    id="rv-name"
                    placeholder="Sam from Capitol Hill"
                    value={fields.name}
                    onChange={e => set('name', e.target.value)}
                    onBlur={() => blur('name')}
                    aria-required="true"
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'e-rv-name' : undefined}
                  />
                  {errors.name && <span className="ferr" id="e-rv-name" role="alert">{errors.name}</span>}
                </div>

                {/* Review text */}
                <div className="form-group">
                  <label htmlFor="rv-review">
                    Your Review <span className="req" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="rv-review"
                    rows={4}
                    maxLength={600}
                    placeholder="What did you order? How was it? Would you order again?"
                    value={fields.review}
                    onChange={e => set('review', e.target.value)}
                    onBlur={() => blur('review')}
                    aria-required="true"
                    aria-invalid={errors.review ? 'true' : 'false'}
                    aria-describedby={errors.review ? 'e-rv-review' : 'h-rv-review'}
                  />
                  <span className="fhint" id="h-rv-review">
                    {fields.review.length}/600 characters
                  </span>
                  {errors.review && <span className="ferr" id="e-rv-review" role="alert">{errors.review}</span>}
                </div>

                <div className="review-disclaimer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Reviews are submitted to us for approval, then posted above.
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={submitting}
                  aria-busy={submitting}
                >
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
