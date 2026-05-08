import { useState, useRef } from 'react';
import { track } from '../lib/analytics.js';

const EVENT_TYPES = [
  { v: 'catering',       label: 'Catering Event',    sub: 'Corporate, wedding, celebration' },
  { v: 'custom-order',   label: 'Custom Order',       sub: 'Something not on the menu' },
  { v: 'private-event',  label: 'Private Event',      sub: 'Birthday, reunion, party' },
  { v: 'other',          label: 'Something Else',     sub: 'Let us know what you need' },
];

function validate(name, value) {
  if (!value.trim()) return 'This field is required.';
  if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
  if (name === 'phone' && !/^[\d\s().+\-]{7,}$/.test(value)) return 'Enter a valid phone number.';
  return '';
}

function Field({ id, label, type = 'text', placeholder, hint, value, onChange, onBlur, error, required, autoComplete, inputMode }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>
        {label} {required && <span className="req" aria-hidden="true">*</span>}
      </label>
      <input
        type={type}
        id={`contact-${id}`}
        name={id}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={`${hint ? `ch-${id} ` : ''}${error ? `ce-${id}` : ''}`}
      />
      {hint  && <span className="fhint" id={`ch-${id}`}>{hint}</span>}
      {error && <span className="ferr"  id={`ce-${id}`} role="alert">{error}</span>}
    </div>
  );
}

export default function ContactSection() {
  const [eventType, setEventType] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fields, setFields] = useState({ name: '', email: '', phone: '', date: '', guests: '', message: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const successRef = useRef(null);

  const setField = (name, value) => {
    setFields(f => ({ ...f, [name]: value }));
    if (touched[name]) {
      const required = ['name', 'email', 'phone', 'message'];
      setErrors(e => ({ ...e, [name]: required.includes(name) ? validate(name, value) : '' }));
    }
  };

  const blur = name => {
    setTouched(t => ({ ...t, [name]: true }));
    const required = ['name', 'email', 'phone', 'message'];
    setErrors(e => ({ ...e, [name]: required.includes(name) ? validate(name, fields[name]) : '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!eventType) {
      setErrors(err => ({ ...err, eventType: 'Please select an inquiry type.' }));
      return;
    }

    const requiredFields = ['name', 'email', 'phone', 'message'];
    const newErrors = {};
    let hasError = false;
    for (const n of requiredFields) {
      const err = validate(n, fields[n]);
      if (err) { newErrors[n] = err; hasError = true; }
    }
    if (hasError) {
      setErrors(newErrors);
      setTouched(Object.fromEntries(requiredFields.map(n => [n, true])));
      return;
    }

    setSubmitting(true);

    const payload = {
      _subject: `Custom / Catering Inquiry from ${fields.name}: ${EVENT_TYPES.find(t => t.v === eventType)?.label}`,
      _replyto: fields.email,
      Name:       fields.name,
      Email:      fields.email,
      Phone:      fields.phone,
      InquiryType: EVENT_TYPES.find(t => t.v === eventType)?.label,
      EventDate:  fields.date || 'Not specified',
      Guests:     fields.guests || 'Not specified',
      Message:    fields.message,
      Submitted:  new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
    };

    const endpoint = (import.meta.env.VITE_FORMSPREE_CONTACT || '').replace(/^<|>$/g, '').trim();

    if (!endpoint || endpoint.includes('REPLACE_ME')) {
      console.log('202BBQ Contact Inquiry (Formspree not configured):', payload);
      await new Promise(r => setTimeout(r, 800));
    } else {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          setSubmitting(false);
          return;
        }
      } catch {
        setSubmitting(false);
        return;
      }
    }

    track('contact_inquiry', { inquiry_type: eventType });

    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => successRef.current?.focus(), 100);
  };

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-heading">
      <div className="container">
        <div className="contact-inner">

          {/* Left: callout copy */}
          <div className="contact-copy">
            <p className="section-eyebrow">Custom Orders &amp; Catering</p>
            <h2 className="contact-title" id="contact-heading">
              Can't find what<br />you're looking for?
            </h2>
            <p className="contact-sub">
              Planning a corporate lunch, wedding reception, birthday party, or need something
              special that's not on the menu? We do it all, smoked low &amp; slow, just for you.
            </p>
            <ul className="contact-features">
              {[
                ['Full-service catering', 'We bring the BBQ to your venue'],
                ['Custom menu builds',   'Pick your proteins, sides, and sauces'],
                ['Any size event',       'From 20 guests to 500+'],
                ['DC-area delivery',     'Full setup and breakdown available'],
              ].map(([title, desc]) => (
                <li key={title} className="contact-feature">
                  <span className="contact-feature-dot" aria-hidden="true" />
                  <div>
                    <strong>{title}</strong>
                    <span>{desc}</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="contact-or-call">
              Or call us directly:&nbsp;
              <a href="tel:2029978912" className="inline-link">202-997-8912</a>
            </p>
          </div>

          {/* Right: form */}
          <div className="contact-form-wrap">
            {submitted ? (
              <div className="contact-success" role="alert" aria-live="assertive" ref={successRef} tabIndex={-1}>
                <div className="contact-success-icon" aria-hidden="true">🔥</div>
                <h3>We'll be in touch!</h3>
                <p>Got your message. We'll reach out within 24 hours to talk through the details and get you a quote.</p>
                <button className="btn btn-ghost" onClick={() => { setSubmitted(false); setFields({ name: '', email: '', phone: '', date: '', guests: '', message: '' }); setEventType(''); }}>
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form className="contact-form" noValidate onSubmit={handleSubmit} aria-label="Custom order and catering inquiry form">

                {/* Inquiry type */}
                <div className="form-section">
                  <p className="form-legend"><span className="form-legend-icon">🎯</span> What are you planning?</p>
                  <div className="radio-group" role="group" aria-label="Inquiry type">
                    {EVENT_TYPES.map(opt => (
                      <label key={opt.v} className="radio-card">
                        <input type="radio" name="event-type" value={opt.v} checked={eventType === opt.v}
                          onChange={() => { setEventType(opt.v); setErrors(e => ({ ...e, eventType: '' })); }} />
                        <span className="radio-dot" aria-hidden="true" />
                        <div className="radio-text">
                          <strong>{opt.label}</strong>
                          <span>{opt.sub}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.eventType && <span className="ferr" role="alert">{errors.eventType}</span>}
                </div>

                {/* Contact info */}
                <div className="form-section">
                  <p className="form-legend"><span className="form-legend-icon">👤</span> Your Information</p>
                  <Field id="name" label="Full Name" placeholder="Sam Smith" autoComplete="name"
                    value={fields.name} onChange={v => setField('name', v)} onBlur={() => blur('name')} error={errors.name} required />
                  <div className="form-row">
                    <Field id="email" label="Email" type="email" placeholder="sam@email.com" autoComplete="email" inputMode="email"
                      value={fields.email} onChange={v => setField('email', v)} onBlur={() => blur('email')} error={errors.email} required />
                    <Field id="phone" label="Phone" type="tel" placeholder="(202) 555-0100" autoComplete="tel" inputMode="tel"
                      value={fields.phone} onChange={v => setField('phone', v)} onBlur={() => blur('phone')} error={errors.phone} required />
                  </div>
                </div>

                {/* Event details */}
                <div className="form-section">
                  <p className="form-legend"><span className="form-legend-icon">📅</span> Event Details</p>
                  <div className="form-row">
                    <Field id="date" label="Event Date" type="date" hint="Approximate is fine."
                      value={fields.date} onChange={v => setField('date', v)} onBlur={() => blur('date')} error={errors.date} />
                    <Field id="guests" label="Guest Count" type="number" placeholder="e.g. 75" inputMode="numeric"
                      value={fields.guests} onChange={v => setField('guests', v)} onBlur={() => blur('guests')} error={errors.guests} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-message">
                      Tell us about your event <span className="req" aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      maxLength={1000}
                      placeholder="Tell us about your event: what you're envisioning, any dietary needs, venue details, or questions you have."
                      value={fields.message}
                      onChange={e => setField('message', e.target.value)}
                      onBlur={() => blur('message')}
                      aria-required="true"
                      aria-invalid={errors.message ? 'true' : 'false'}
                      aria-describedby={errors.message ? 'ce-message' : undefined}
                    />
                    {errors.message && <span className="ferr" id="ce-message" role="alert">{errors.message}</span>}
                  </div>
                </div>

                <div className="submit-area">
                  <p className="submit-disclaimer">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    No commitment. We'll reply within 24 hours with availability and pricing.
                  </p>
                  <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={submitting} aria-busy={submitting}>
                    {submitting ? 'Sending…' : 'Send Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
