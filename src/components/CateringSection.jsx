import { useRef, useState } from 'react';
import { SITE } from '../data/site.js';
import reviews from '../data/reviews.json';
import { useCart } from '../context/CartContext.jsx';
import { phoneDigits, groupPhone } from '../lib/format.js';
import { stampET, addDays, nowET, fmtLong } from '../lib/time.js';
import { submitToFormspree } from '../lib/formspree.js';
import { track } from '../lib/analytics.js';
import { TextField, TextArea, RadioCardGroup, ErrorSummary, Notice } from './ui/Field.jsx';
import Button from './ui/Button.jsx';
import { Section, PhoneLink } from './ui/Bits.jsx';

const TYPES = [
  { value: 'full-service', title: 'Full-service catering', sub: 'We set up and serve' },
  { value: 'drop-off',     title: 'Trays for a big event', sub: '100+ people, we drop off' },
  { value: 'custom',       title: 'A custom order', sub: 'Something not on the menu' },
  { value: 'question',     title: 'A question', sub: 'Anything else' },
];
const STYLES = [
  { value: 'drop-off', title: 'Drop-off', sub: 'We drop trays and set up, you serve' },
  { value: 'buffet',   title: 'Buffet setup', sub: 'Trays, warming dishes and serving gear on site' },
  { value: 'full',     title: 'Full service', sub: 'We cook, serve and clean up' },
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const label = (list, v) => list.find(x => x.value === v)?.title ?? '';
const NOUN = { 'full-service': 'full-service catering', 'drop-off': 'drop-off order', custom: 'custom order', question: null };

function nextBusinessDay(ymd) {
  let d = addDays(ymd, 1);
  const dow = new Date(`${d}T12:00:00Z`).getUTCDay();
  if (dow === 6) d = addDays(d, 2);
  if (dow === 0) d = addDays(d, 1);
  return d;
}

export default function CateringSection() {
  const { customer, setCustomer } = useCart();
  const [f, setF] = useState({ type: '', when: '', guests: '', where: '', style: '', details: '' });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [done, setDone] = useState(null);
  const summaryRef = useRef(null);
  const doneRef = useRef(null);
  const set = patch => setF(s => ({ ...s, ...patch }));
  const clearErr = id => setErrors(e => { if (!e[id]) return e; const n = { ...e }; delete n[id]; return n; });

  const isQuestion = f.type === 'question';
  const askStyle = f.type === 'full-service' || f.type === 'drop-off';
  const proof = reviews.find(r => r.id.startsWith('jerod'));

  const validate = () => {
    const e = {};
    if (!f.type) e['ev-type'] = 'Choose what you are planning.';
    if (!isQuestion && !f.when.trim()) e['ev-when'] = 'Tell us when the event is — a date, or roughly when.';
    if (!isQuestion && !f.guests.trim()) e['ev-guests'] = 'Tell us roughly how many people, or type “not sure”.';
    if (!isQuestion && !f.where.trim()) e['ev-where'] = 'Tell us the city or ZIP code.';
    if (askStyle && !f.style) e['ev-style'] = 'Choose a service style.';
    if (!customer.name.trim()) e['ev-name'] = 'Enter your full name.';
    if (phoneDigits(customer.phone).length !== 10) e['ev-phone'] = 'Enter a phone number we can call, for example 202 555 0100.';
    if (customer.email.trim() && !EMAIL_RE.test(customer.email.trim())) e['ev-email'] = 'Enter an email address like name@example.com, or leave it blank.';
    if (!f.details.trim()) e['ev-details'] = isQuestion ? 'Type your question.' : 'Tell us a little about the event.';
    return e;
  };

  const onSubmit = async ev => {
    ev.preventDefault();
    const e = validate();
    setErrors(e); setSendError('');
    if (Object.keys(e).length) { document.title = document.title.startsWith('Error: ') ? document.title : `Error: ${document.title}`; setTimeout(() => { summaryRef.current?.scrollIntoView({ block: 'start' }); summaryRef.current?.focus({ preventScroll: true }); }, 0); return; }
    document.title = document.title.replace(/^Error: /, '');
    setSending(true);
    const email = customer.email.trim();
    const payload = {
      _subject: isQuestion
        ? `Question from ${customer.name.trim()}`
        : `Event request · ${label(TYPES, f.type)} · ${f.guests.trim() ? `${f.guests.trim()} people` : 'headcount not given'} · ${customer.name.trim()}`,
      ...(email ? { email, _replyto: email } : {}),
      _gotcha: ev.target.elements._gotcha?.value ?? '',
      Summary: [
        `EVENT REQUEST · ${label(TYPES, f.type)}`,
        `${customer.name.trim()} · ${groupPhone(customer.phone)}${email ? ` · ${email}` : ''}`,
        isQuestion ? null : `When: ${f.when.trim() || 'not given'} · People: ${f.guests.trim() || 'not given'} · Where: ${f.where.trim() || 'not given'}${askStyle ? ` · Style: ${label(STYLES, f.style)}` : ''}`,
        `Details: ${f.details.trim()}`,
        `Sent ${stampET()}`,
      ].filter(Boolean).join('\n'),
      Type: label(TYPES, f.type),
      ...(f.when.trim() ? { When: f.when.trim() } : {}),
      ...(f.guests.trim() ? { People: f.guests.trim() } : {}),
      ...(f.where.trim() ? { Where: f.where.trim() } : {}),
      ...(askStyle ? { 'Service style': label(STYLES, f.style) } : {}),
      name: customer.name.trim(),
      phone: groupPhone(customer.phone),
      Details: f.details.trim(),
      'Submitted (ET)': stampET(),
      Page: `${SITE.url}#catering`,
    };
    const result = await submitToFormspree(SITE.forms.events, payload);
    setSending(false);
    if (!result.ok) { setSendError(result.error); return; }
    track('generate_lead', { lead_type: 'catering', event_type: f.type, guests: Number(f.guests) || 0 });
    setDone({ type: f.type, when: f.when.trim(), guests: f.guests.trim(), replyBy: fmtLong(nextBusinessDay(nowET().ymd)) });
    setTimeout(() => doneRef.current?.focus(), 50);
  };

  return (
    <Section id="catering" title="Plan an event" className="catering" grid stickyHead
      lede={`From 20 guests to 500. Drop-off trays, buffet setup, or full service with our smoker on site. We serve ${SITE.serviceArea}.`}
      headExtra={(
        <ul className="proof catering-proof">
          {proof && <li>Catered a 70-guest grand opening — “many went back for seconds”</li>}
          <li>Menus built around the <a href="#menu">tray menu</a></li>
          {SITE.eventNoticeHours && <li>{SITE.eventNoticeHours} hours' notice</li>}
        </ul>
      )}>
      {done ? (
        <div className="form-done" tabIndex={-1} ref={doneRef}>
          <h3>Got it{customer.name ? `, ${customer.name.trim().split(/\s+/)[0]}` : ''}.</h3>
          <p>{SITE.owner} will reply by {done.replyBy}{NOUN[done.type] ? ` with a quote for your ${NOUN[done.type]}` : ''}{done.guests ? ` for ${done.guests} people` : ''}{done.when ? ` (${done.when})` : ''}. Or call <PhoneLink location="catering_done" />.</p>
          <Button variant="secondary" size="compact" onClick={() => { setDone(null); setF({ type: '', when: '', guests: '', where: '', style: '', details: '' }); }}>Send another</Button>
        </div>
      ) : (
        <form className="event-form" noValidate onSubmit={onSubmit}>
          <ErrorSummary errors={Object.entries(errors).map(([id, message]) => ({ id, message }))} summaryRef={summaryRef} />
          <RadioCardGroup id="ev-type" name="ev-type" legend="What are you planning?" value={f.type} onChange={v => { set({ type: v }); clearErr('ev-type'); }} options={TYPES} cols={2} error={errors['ev-type']} />
          {!isQuestion && (
            <>
              <TextField id="ev-when" name="ev-when" label="When is it?" value={f.when} onChange={v => { set({ when: v }); clearErr('ev-when'); }} error={errors['ev-when']} hint='A date, or roughly when — “mid-October” is fine.' autoComplete="off" />
              <TextField id="ev-guests" name="ev-guests" label="How many people?" value={f.guests} onChange={v => { set({ guests: v }); clearErr('ev-guests'); }} error={errors['ev-guests']} hint='A rough number is fine, or “not sure”.' inputMode="numeric" autoComplete="off" />
              <TextField id="ev-where" name="ev-where" label="Where?" value={f.where} onChange={v => { set({ where: v }); clearErr('ev-where'); }} error={errors['ev-where']} hint="City or ZIP code." autoComplete="postal-code" />
            </>
          )}
          {askStyle && (
            <RadioCardGroup id="ev-style" name="ev-style" legend="How should we serve it?" value={f.style} onChange={v => { set({ style: v }); clearErr('ev-style'); }} options={STYLES} cols={3} error={errors['ev-style']} />
          )}
          <TextField id="ev-name" name="name" label="Full name" autoComplete="name" value={customer.name} onChange={v => { setCustomer({ name: v }); clearErr('ev-name'); }} error={errors['ev-name']} />
          <TextField id="ev-phone" name="phone" label="Phone number" type="tel" autoComplete="tel" inputMode="tel" value={customer.phone} onChange={v => { setCustomer({ phone: v }); clearErr('ev-phone'); }} error={errors['ev-phone']} hint="We’ll call this number." />
          <TextField id="ev-email" name="email" label="Email" optional type="email" autoComplete="email" inputMode="email" value={customer.email} onChange={v => { setCustomer({ email: v }); clearErr('ev-email'); }} error={errors['ev-email']} />
          <TextArea id="ev-details" name="details" label={isQuestion ? 'Your question' : 'Tell us about it'} value={f.details} onChange={v => { set({ details: v }); clearErr('ev-details'); }} error={errors['ev-details']} maxLength={1000}
            hint={isQuestion ? undefined : 'Menu ideas, dietary needs, timing, the venue — whatever you know so far.'} />
          <input type="text" name="_gotcha" className="gotcha" tabIndex={-1} aria-hidden="true" autoComplete="off" defaultValue="" />
          {sendError && <Notice kind="error" role="alert">{sendError}</Notice>}
          <Button type="submit" size="lg" mobileFull busy={sending}>Send my event request</Button>
          <p className="small muted form-after">{SITE.owner} replies within one business day. Or call <PhoneLink location="catering_form" />.</p>
        </form>
      )}
    </Section>
  );
}
