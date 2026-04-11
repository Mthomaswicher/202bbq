import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';

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

export default function ReviewSection() {
  const { addToast } = useToast();

  const [fields, setFields]       = useState({ name: '', review: '' });
  const [rating, setRating]       = useState(0);
  const [errors, setErrors]       = useState({});
  const [touched, setTouched]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section className="review-section" aria-labelledby="review-heading">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">Spread the Smoke</p>
          <h2 className="section-title" id="review-heading">Share Your Experience</h2>
          <p className="section-sub">
            Had 202BBQ? We'd love to hear from you. Your feedback helps us grow and helps
            other DC folks find us.
          </p>
        </div>

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
                <p>We appreciate you taking the time. Your review means a lot to us.</p>
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
                  Reviews are submitted directly to us. We read every one.
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
