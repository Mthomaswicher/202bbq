import { useState, useRef } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { track } from '../lib/analytics.js';

const EVENT_TYPES = [
  'Wedding',
  'Corporate Event',
  'Birthday Party',
  'Anniversary',
  'Graduation',
  'Holiday Party',
  'Private Party',
  'Backyard BBQ',
  'Other',
];

const SERVICE_TYPES = [
  { v: 'dropoff',    label: 'Drop-Off',            sub: 'We drop trays & setup — you serve' },
  { v: 'buffet',     label: 'Buffet Setup',        sub: 'Trays, chafers & serving gear on-site' },
  { v: 'fullservice', label: 'Full-Service / On-Site Smoking', sub: 'We cook, serve & clean up' },
];

const BUDGETS = [
  'Under $500',
  '$500–$1,500',
  '$1,500–$3,000',
  '$3,000–$5,000',
  '$5,000–$10,000',
  '$10,000+',
  'Not sure yet',
];

function validate(name, value) {
  if (!value || !String(value).trim()) return 'This field is required.';
  if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
  if (name === 'phone' && !/^[\d\s().+\-]{7,}$/.test(value)) return 'Enter a valid phone number.';
  if (name === 'guests' && (!/^\d+$/.test(value) || Number(value) < 1)) return 'Enter a valid guest count.';
  return '';
}

function makeCateringRef() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CAT-${yy}${mm}${dd}-${rand}`;
}

export default function CateringSection() {
  const { addToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cateringRef, setCateringRef] = useState('');
  const successRef = useRef(null);

  const [fields, setFields] = useState({
    fname: '', lname: '', email: '', phone: '',
    eventType: '', eventDate: '', guests: '', venue: '', budget: '', details: '',
  });
  const [serviceType, setServiceType] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setField = (name, value) => {
    setFields(f => ({ ...f, [name]: value }));
    if (touched[name]) setErrors(e => ({ ...e, [name]: validate(name, value) }));
  };

  const blur = (name) => {
    setTouched(t => ({ ...t, [name]: true }));
    setErrors(e => ({ ...e, [name]: validate(name, fields[name]) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = ['fname', 'lname', 'email', 'phone', 'eventType', 'eventDate', 'guests', 'venue'];
    const newErrors = {};
    let hasError = false;
    for (const name of required) {
      const err = validate(name, fields[name]);
      if (err) { newErrors[name] = err; hasError = true; }
    }
    if (!serviceType) {
      addToast('Please choose a service type.', 'error');
      hasError = true;
    }
    if (hasError) {
      setErrors(newErrors);
      setTouched(Object.fromEntries(required.map(n => [n, true])));
      if (Object.keys(newErrors).length) addToast('Please fix the errors below.', 'error');
      return;
    }

    setSubmitting(true);

    const thisRef = makeCateringRef();
    const serviceLabel = SERVICE_TYPES.find(s => s.v === serviceType)?.label || serviceType;

    const payload = {
      _subject: `New Catering Inquiry: ${fields.eventType} for ${fields.guests} — ${fields.fname} ${fields.lname} (${thisRef})`,
      _replyto: fields.email,
      CateringRef: thisRef,
      Name:        `${fields.fname} ${fields.lname}`,
      Email:       fields.email,
      Phone:       fields.phone,
      EventType:   fields.eventType,
      EventDate:   fields.eventDate,
      GuestCount:  fields.guests,
      Venue:       fields.venue,
      ServiceType: serviceLabel,
      Budget:      fields.budget || 'Not specified',
      Details:     fields.details || 'None',
      Submitted:   new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
    };

    const endpoint = import.meta.env.VITE_FORMSPREE_CATERING;

    if (!endpoint || endpoint.includes('REPLACE_ME') || endpoint.includes('YOUR_')) {
      console.log('202BBQ Catering Inquiry (Formspree not configured):', payload);
      await new Promise(r => setTimeout(r, 800));
    } else {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setSubmitting(false);
          addToast(data?.error || "Submit failed. Please try again or call 202-997-8912.", 'error');
          return;
        }
      } catch {
        setSubmitting(false);
        addToast("Network issue. Check your connection, try again, or call 202-997-8912.", 'error');
        return;
      }
    }

    track('generate_lead', {
      lead_type: 'catering',
      event_type: fields.eventType,
      service_type: serviceLabel,
      guests: Number(fields.guests) || 0,
      catering_ref: thisRef,
    });

    setCateringRef(thisRef);
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => successRef.current?.focus(), 100);
  };

  if (submitted) {
    return (
      <section className="order-section" id="catering">
        <div className="container">
          <div className="order-success" role="alert" aria-live="assertive">
            <h2 ref={successRef} tabIndex={-1}>Catering Inquiry Received!</h2>
            <p>Thanks — we got your event details. We'll reach out within a few hours with a custom quote and next steps.</p>
            {cateringRef && (
              <p className="deposit-order-ref">
                <span>Inquiry reference</span>
                <code>{cateringRef}</code>
              </p>
            )}
            <div className="success-actions">
              <button className="btn btn-ghost" onClick={() => setSubmitted(false)}>Submit Another Inquiry</button>
              <a href="https://www.instagram.com/202_bbq" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Follow @202_bbq
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="order-section" id="catering" aria-labelledby="catering-heading">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">Catering</p>
          <h2 className="section-title" id="catering-heading">Book 202BBQ for Your Event</h2>
          <p className="section-sub">
            Weddings, corporate events, birthdays, backyard bashes — tell us about your event and we'll send a custom quote.
            Questions? Call <a href="tel:2029978912" className="inline-link">202-997-8912</a>.
          </p>
        </div>

        <form className="order-form" id="catering-form" noValidate onSubmit={handleSubmit} aria-label="Catering inquiry form" style={{ maxWidth: 820, margin: '0 auto' }}>

          {/* Event Details */}
          <div className="form-section">
            <p className="form-legend"><span className="form-legend-icon">🎉</span> Event Details</p>

            <div className="form-group">
              <label htmlFor="eventType">Event Type <span className="req" aria-hidden="true">*</span></label>
              <select
                id="eventType"
                name="eventType"
                value={fields.eventType}
                onChange={e => setField('eventType', e.target.value)}
                onBlur={() => blur('eventType')}
                required
                aria-required="true"
                aria-invalid={errors.eventType ? 'true' : 'false'}
              >
                <option value="">Select event type…</option>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.eventType && <span className="ferr" role="alert">{errors.eventType}</span>}
            </div>

            <div className="form-row">
              <Field id="eventDate" label="Event Date" type="date"
                value={fields.eventDate} onChange={v => setField('eventDate', v)} onBlur={() => blur('eventDate')} error={errors.eventDate} required />
              <Field id="guests" label="Number of Guests" type="number" placeholder="e.g. 50" inputMode="numeric"
                value={fields.guests} onChange={v => setField('guests', v)} onBlur={() => blur('guests')} error={errors.guests} required />
            </div>

            <Field id="venue" label="Venue / Location" placeholder="Address, venue name, or neighborhood"
              value={fields.venue} onChange={v => setField('venue', v)} onBlur={() => blur('venue')} error={errors.venue} required />

            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
                Service Type <span style={{ color: 'var(--ember)' }}>*</span>
              </p>
              <div className="radio-group">
                {SERVICE_TYPES.map(opt => (
                  <label key={opt.v} className="radio-card">
                    <input type="radio" name="serviceType" value={opt.v}
                      checked={serviceType === opt.v} onChange={() => setServiceType(opt.v)} />
                    <span className="radio-dot" aria-hidden="true" />
                    <div className="radio-text">
                      <strong>{opt.label}</strong>
                      <span>{opt.sub}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 16 }}>
              <label htmlFor="budget">Estimated Budget <span className="fhint" style={{ marginLeft: 6 }}>(optional)</span></label>
              <select
                id="budget"
                name="budget"
                value={fields.budget}
                onChange={e => setField('budget', e.target.value)}
              >
                <option value="">Select a range…</option>
                {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="form-section">
            <p className="form-legend"><span className="form-legend-icon">👤</span> Your Information</p>
            <div className="form-row">
              <Field id="fname" label="First Name" placeholder="Sam"   autoComplete="given-name"
                value={fields.fname} onChange={v => setField('fname', v)} onBlur={() => blur('fname')} error={errors.fname} required />
              <Field id="lname" label="Last Name"  placeholder="Smith" autoComplete="family-name"
                value={fields.lname} onChange={v => setField('lname', v)} onBlur={() => blur('lname')} error={errors.lname} required />
            </div>
            <Field id="email" label="Email Address" type="email" placeholder="sam@email.com" autoComplete="email" inputMode="email"
              value={fields.email} onChange={v => setField('email', v)} onBlur={() => blur('email')} error={errors.email} required />
            <Field id="phone" label="Phone Number"  type="tel"   placeholder="(202) 555-0100" autoComplete="tel" inputMode="tel"
              value={fields.phone} onChange={v => setField('phone', v)} onBlur={() => blur('phone')} error={errors.phone} required />
          </div>

          {/* Details */}
          <div className="form-section">
            <p className="form-legend"><span className="form-legend-icon">📝</span> Tell us more</p>
            <div className="form-group">
              <label htmlFor="details">Menu ideas, dietary needs, timing, theme, anything else?</label>
              <textarea id="details" name="details" rows={5} maxLength={2000}
                placeholder="e.g. 60 guests, brisket + pulled pork + 2 sides, vegetarian option for 5, cocktail hour starts at 5pm, outdoor venue with power access…"
                value={fields.details} onChange={e => setField('details', e.target.value)}
              />
              <span className="fhint">Up to 2000 characters.</span>
            </div>
          </div>

          {/* Submit */}
          <div className="submit-area">
            <p className="submit-disclaimer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              We'll follow up within a few hours with a custom quote. Nothing is booked until we confirm.
            </p>
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? 'Sending…' : 'Request Catering Quote'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({ id, label, type = 'text', placeholder, hint, value, onChange, onBlur, error, required, autoComplete, inputMode }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>
        {label} {required && <span className="req" aria-hidden="true">*</span>}
      </label>
      <input
        type={type}
        id={id}
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
        aria-describedby={`${hint ? `h-${id} ` : ''}${error ? `e-${id}` : ''}`}
      />
      {hint  && <span className="fhint" id={`h-${id}`}>{hint}</span>}
      {error && <span className="ferr"  id={`e-${id}`} role="alert">{error}</span>}
    </div>
  );
}
