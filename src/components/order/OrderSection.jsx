import { useEffect, useMemo, useRef, useState } from 'react';
import { SITE, DEPOSIT_SENTENCE, CANCEL_TERMS, PICKUP_AREA, DELIVERY_FEE_SENTENCE } from '../../data/site.js';
import { getItem, getOption } from '../../data/menu.js';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { money, feedsRange, groupPhone, phoneDigits, maskEmail, summarise, plural } from '../../lib/format.js';
import { makeRef, stampET, nowET, visitorOutsideET, fmtLong } from '../../lib/time.js';
import { submitToFormspree } from '../../lib/formspree.js';
import { buildDepositUrl, readDepositReturn, loadRequest, saveRequest, clearRequest } from '../../lib/depositReturn.js';
import { session, KEYS } from '../../lib/storage.js';
import { track } from '../../lib/analytics.js';
import { focusHeading } from '../../lib/useScrollSpy.js';
import { useOrderWindow } from '../StatusLine.jsx';
import { OrderLines, OrderTotals } from '../menu/OrderLines.jsx';
import { TextField, TextArea, RadioCardGroup, ErrorSummary, Notice, focusField } from '../ui/Field.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { PhoneLink, CopyButton } from '../ui/Bits.jsx';

const WINDOWS = [
  { value: 'morning',   title: 'Morning',   sub: '10 am–1 pm' },
  { value: 'midday',    title: 'Midday',    sub: '1–4 pm' },
  { value: 'afternoon', title: 'Afternoon', sub: '4–8 pm' },
];
const windowLabel = v => { const w = WINDOWS.find(x => x.value === v); return w ? `${w.title} ${w.sub}` : ''; };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function lineText(l) {
  const item = getItem(l.itemId), option = getOption(l.itemId, l.optionId);
  if (!item || !option) return '';
  if (option.pricing === 'quote') return `${l.qty}× ${item.name} — ${option.label} (${feedsRange(option.feeds)}) — market price, quote before confirming`;
  if (option.unit) return `${l.qty}× ${item.name} — per ${option.unit} (${option.minQty ?? 1} minimum) — ${money(option.price * l.qty)} (${money(option.price)} each)`;
  return `${l.qty}× ${item.name} — ${option.label} (${feedsRange(option.feeds)}) — ${money(option.price * l.qty)}`;
}

/* ---------- read-only recap from a saved request ---------- */
function RecapLines({ lines }) {
  return (
    <ul className="orderlines compact recap">
      {lines.map(l => {
        const item = getItem(l.itemId), option = getOption(l.itemId, l.optionId);
        if (!item || !option) return null;
        const isQuote = option.pricing === 'quote';
        return (
          <li key={`${l.itemId}::${l.optionId}`} className="orderline">
            <div className="orderline-main">
              <span className="orderline-name">{l.qty}× {item.name}</span>
              <span className="orderline-opt small muted">{option.unit ? `per ${option.unit}` : `${option.label} (${feedsRange(option.feeds)})`}</span>
            </div>
            <span className="orderline-price price">{isQuote ? <span className="small">market price</span> : money(option.price * l.qty)}</span>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- deposit block (state A / D-back) ---------- */
function DepositBlock({ req, onClaimed, onCopied, quiet }) {
  const url = buildDepositUrl(req.ref, req.email);
  const handles = [
    SITE.paymentHandles.cashapp && { label: 'Cash App', value: SITE.paymentHandles.cashapp },
    SITE.paymentHandles.venmo && { label: 'Venmo', value: SITE.paymentHandles.venmo },
    SITE.paymentHandles.zelle && { label: 'Zelle', value: SITE.paymentHandles.zelle },
  ].filter(Boolean);
  const note = `202BBQ ${req.ref}${req.day?.short ? ` ${req.day.short}` : ''}`;
  return (
    <div className="deposit-block">
      {url ? (
        <>
          <Button href={url} size="lg" mobileFull onClick={() => track('begin_checkout', { currency: 'USD', value: SITE.depositAmount, payment_method: 'stripe', order_ref: req.ref })}>
            Pay the ${SITE.depositAmount} deposit
          </Button>
          <p className="small muted">Card, Apple Pay, Google Pay. Refunded in full if we can't fill your request.</p>
        </>
      ) : (
        <p>{SITE.owner} will text you a secure payment link, or take Cash App, Venmo or Zelle.</p>
      )}
      {quiet && <p className="small muted deposit-quiet">Deposit not paid yet — that's fine, you can pay when {SITE.owner} calls.</p>}
      {handles.length > 0 && (
        <div className="handles">
          <p className="small">Or send ${SITE.depositAmount} by:</p>
          <ul>
            {handles.map(h => (
              <li key={h.label} className="copy-row">
                <span><strong>{h.label}</strong> <code>{h.value}</code></span>
                <CopyButton text={h.value} onCopied={() => onCopied(`${h.label} copied`)} />
              </li>
            ))}
          </ul>
          <p className="copy-row small">
            <span>Put this in the note: <code>{note}</code></span>
            <CopyButton text={note} label="Copy note" onCopied={() => onCopied('Note copied')} />
          </p>
          {req.deposit?.status === 'manual_claimed'
            ? <p className="small"><Icon name="check" size={18} /> Thanks — {SITE.owner} will match it to your request when he confirms.</p>
            : <Button variant="secondary" size="compact" onClick={onClaimed}>I sent it</Button>}
        </div>
      )}
      <p className="small muted">{CANCEL_TERMS}</p>
    </div>
  );
}

/* ---------- confirmation (states A, C, D) ---------- */
function Confirmation({ req, paid, paidNoReq, quiet, headingRef, onClaimed, onNew }) {
  const { addToast } = useToast();
  const first = (req?.name || '').trim().split(/\s+/)[0];
  const url = buildDepositUrl(req?.ref ?? '', req?.email);
  const sum = req ? summarise(req.lines.map(l => ({ option: getOption(l.itemId, l.optionId) ?? { feeds: [0, 0], price: 0 }, qty: l.qty }))) : null;
  const balance = sum ? Math.max(0, sum.subtotal - SITE.depositAmount) : 0;
  const dayLong = req?.day?.long;
  const delivery = req?.method === 'Delivery';

  const summaryText = req ? [
    `REQUEST ${req.ref} · ${req.day?.short ?? ''} · ${req.method} · ${req.window ?? ''}`,
    `${req.name} · ${groupPhone(req.phone)}${req.email ? ` · ${req.email}` : ''}`,
    ...req.lines.map(lineText),
    `Subtotal ${money(req.subtotal)}${sum?.feedsHi ? ` · feeds about ${sum.feedsLo}–${sum.feedsHi}` : ''}`,
    `Pay the $${SITE.depositAmount} deposit: ${url ?? 'ask ' + SITE.owner}`,
    `Questions: ${SITE.phone}`,
  ].join('\n') : '';
  const mailto = req?.email ? `mailto:${encodeURIComponent(req.email)}?subject=${encodeURIComponent(`Your 202BBQ request ${req.ref} · ${req.day?.short ?? ''}`)}&body=${encodeURIComponent(summaryText)}` : null;
  const sms = `${SITE.smsHref}?body=${encodeURIComponent(`Hi ${SITE.owner}, about request ${req?.ref ?? ''}`)}`;
  const ics = req?.day?.ymd ? `data:text/calendar;charset=utf-8,${encodeURIComponent([
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//202BBQ//EN', 'BEGIN:VEVENT',
    `UID:${req.ref}@202barbecue.com`, `DTSTART;VALUE=DATE:${req.day.ymd.replace(/-/g, '')}`,
    `SUMMARY:202BBQ ${delivery ? 'delivery' : 'pickup'} — request ${req.ref}`,
    `DESCRIPTION:${summaryText.replace(/\n/g, '\\n')}`, 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n'))}` : null;

  return (
    <div className="confirmation">
      <h2 id="order-heading" tabIndex={-1} ref={headingRef}>
        {paid ? `Deposit received — thank you${first ? `, ${first}` : ''}.` : `We got your request${first ? `, ${first}` : ''}.`}
      </h2>

      {paidNoReq ? (
        <p className="lede">Your deposit went through. {SITE.owner} confirms by phone or email. Questions? Call <PhoneLink location="confirmation" />.</p>
      ) : (
        <>
          <p className="ref-line mono">
            Request <strong>{req.ref}</strong>{dayLong && <> · {dayLong}</>} · {req.method} · sent {req.submittedLabel}
            <CopyButton text={req.ref} label="Copy" onCopied={() => addToast('Reference copied')} className="ref-copy" />
          </p>
          {paid
            ? <p className="small muted">{req.email ? `Stripe emailed your receipt to ${maskEmail(req.email)}.` : 'Stripe has your receipt.'}</p>
            : <p className="small muted">Keep this page — screenshot or print it{mailto ? <>, or <a href={mailto}>email yourself a copy</a></> : ''}.</p>}

          <h3>What happens next</h3>
          <ol className="next-steps">
            <li>
              <span className="step-num" aria-hidden="true">1</span>
              <div>
                <p className="step-title">We confirm.</p>
                <p>{SITE.owner} calls or emails you within a few hours (Mon–Thu). Nothing is final until then.</p>
              </div>
            </li>
            <li>
              <span className="step-num" aria-hidden="true">2</span>
              <div>
                {paid ? (
                  <>
                    <p className="step-title"><Icon name="check" size={20} /> You paid the ${SITE.depositAmount} deposit.</p>
                    <p>Balance {money(balance)} at {delivery ? 'delivery' : 'pickup'}.</p>
                  </>
                ) : (
                  <>
                    <p className="step-title">You hold it with a ${SITE.depositAmount} deposit — now or when {SITE.owner} calls.</p>
                    <DepositBlock req={req} onClaimed={onClaimed} onCopied={msg => addToast(msg)} quiet={quiet} />
                  </>
                )}
              </div>
            </li>
            <li>
              <span className="step-num" aria-hidden="true">3</span>
              <div>
                <p className="step-title">We smoke Friday night.</p>
                <p>
                  {delivery
                    ? <>We deliver {dayLong ?? 'on the day we agree'}, between {SITE.fulfilHours.open} and {SITE.fulfilHours.close} — we'll agree the hour with you.</>
                    : <>Pick up {dayLong ?? 'on the day we agree'} at the time we agree — the address is in your confirmation call or text.</>}
                </p>
              </div>
            </li>
          </ol>

          <h3>Your trays</h3>
          <RecapLines lines={req.lines} />
          <p className="ordertotals-subtotal"><span>Subtotal</span><span className="price">{money(req.subtotal)}</span></p>
          {req.hasQuote && <p className="small muted">+ market-price items, quoted on confirmation</p>}
          {!paid && <p className="small muted">Balance at {delivery ? 'delivery' : 'pickup'}: {money(balance)} after the deposit.</p>}

          <ul className="confirm-actions">
            {ics && <li><a className="btn btn-secondary btn-compact" href={ics} download={`202BBQ-${req.ref}.ics`}><Icon name="calendar" size={20} />Add to calendar</a></li>}
            <li><a className="btn btn-secondary btn-compact" href={sms}><Icon name="message" size={20} />Text us</a></li>
            <li><PhoneLink button="secondary" size="compact" location="confirmation" label={`Call ${SITE.phone}`} /></li>
            {mailto && <li><a className="btn btn-secondary btn-compact" href={mailto}><Icon name="mail" size={20} />Email me a copy</a></li>}
            <li><a className="btn btn-secondary btn-compact" href="#menu" onClick={() => focusHeading('menu')}><Icon name="arrowUp" size={20} />Back to menu</a></li>
          </ul>
        </>
      )}
      <p className="small muted new-request"><button type="button" className="btn btn-tertiary btn-compact" onClick={onNew}>Start a new request</button></p>
    </div>
  );
}

/* ---------- resume card (state D, reopened later) ---------- */
function ResumeCard({ req, onNew }) {
  const url = buildDepositUrl(req.ref, req.email);
  const when = new Date(req.submittedAt).toLocaleDateString('en-US', { weekday: 'long', timeZone: SITE.cutoff.tz });
  const trays = req.lines.reduce((s, l) => s + l.qty, 0);
  return (
    <div className="resume-card">
      <p>Your request from {when}, <strong className="mono">{req.ref}</strong> ({req.day?.short ?? req.method} · {plural(trays, 'tray')}).</p>
      <ul className="confirm-actions">
        {url && <li><Button href={url} size="compact">Pay the ${SITE.depositAmount} deposit</Button></li>}
        <li><PhoneLink button="secondary" size="compact" location="resume" label={`Call ${SITE.phone}`} /></li>
        <li><Button variant="secondary" size="compact" onClick={onNew}>Start a new request</Button></li>
      </ul>
    </div>
  );
}

/* ---------- the section ---------- */
export default function OrderSection() {
  const { lines, lineCount, summary, customer, setCustomer, draft, setDraft, headcount, clearLines } = useCart();
  const { addToast } = useToast();
  const win = useOrderWindow();

  const [ret] = useState(readDepositReturn);
  const [req, setReq] = useState(() => loadRequest(ret?.ref));
  const [phase, setPhase] = useState(() => (ret ? 'paid' : (req && session.get(KEYS.request) ? 'sent' : 'form')));
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [notesOpen, setNotesOpen] = useState(Boolean(draft.notes));
  const headingRef = useRef(null);
  const summaryRef = useRef(null);
  const outsideET = visitorOutsideET();

  // Returned from Stripe: record it, announce it, scroll here.
  useEffect(() => {
    if (!ret) return;
    const next = { ...(req || { ref: ret.ref, lines: [], subtotal: 0, method: '', name: '' }), deposit: { status: 'stripe_returned', at: Date.now() } };
    if (req) { setReq(next); saveRequest(next); }
    track('purchase', { value: SITE.depositAmount, currency: 'USD', order_ref: next.ref });
    setTimeout(() => { document.getElementById('order')?.scrollIntoView(); headingRef.current?.focus({ preventScroll: true }); }, 50);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isDelivery = draft.method === 'delivery';
  const dayOptions = useMemo(() => ([
    { value: win.dates[0].ymd, title: win.dates[0].long, sub: win.nextWeekend ? 'Next weekend' : 'This weekend' },
    { value: win.dates[1].ymd, title: win.dates[1].long, sub: win.nextWeekend ? 'Next weekend' : 'This weekend' },
    { value: 'unsure', title: 'Not sure — call me', sub: 'We\'ll pick a day together' },
  ]), [win]);

  const validate = () => {
    const e = {};
    if (!draft.day) e['order-day'] = 'Choose Saturday, Sunday, or "Not sure — call me".';
    if (!draft.window) e['order-window'] = 'Choose a time that works: morning, midday or afternoon.';
    if (!draft.method) e['order-method'] = 'Choose pickup or delivery.';
    if (isDelivery && !draft.address.trim()) e['order-address'] = 'Enter the delivery address, including city.';
    if (!customer.name.trim()) e['order-name'] = 'Enter your full name so we know who to call.';
    if (phoneDigits(customer.phone).length !== 10) e['order-phone'] = 'Enter a phone number we can call, for example 202 555 0100.';
    if (customer.email.trim() && !EMAIL_RE.test(customer.email.trim())) e['order-email'] = 'Enter an email address like name@example.com, or leave it blank.';
    return e;
  };

  const onSubmit = async ev => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setSendError('');
    if (Object.keys(e).length) {
      document.title = document.title.startsWith('Error: ') ? document.title : `Error: ${document.title}`;
      setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }
    document.title = document.title.replace(/^Error: /, '');
    setSending(true);

    const now = nowET();
    const ref = makeRef(now);
    const submittedAt = Date.now();
    const submittedLabel = stampET();
    const dayInfo = draft.day === 'unsure' ? { ymd: null, short: 'Not sure — call me', long: null } : (win.dates.find(d => d.ymd === draft.day) ?? { ymd: draft.day, short: fmtLong(draft.day), long: fmtLong(draft.day) });
    const method = isDelivery ? 'Delivery' : 'Pickup';
    const lineSnap = lines.map(l => ({ itemId: l.item.id, optionId: l.option.id, qty: l.qty }));
    const trayText = lineSnap.map(lineText).join('\n');
    const feeds = summary.feedsHi ? `about ${summary.feedsLo}–${summary.feedsHi}` : 'n/a';
    const email = customer.email.trim();
    const subtotalText = summary.hasQuote ? `${money(summary.subtotal)} + market-price items (quote before confirming)` : money(summary.subtotal);
    const trayCount = summary.trays + summary.units;
    const depositLine = `Not yet at time of request — look for ${email || customer.name.trim()} in Stripe, or note 202BBQ ${ref} in Cash App/Venmo/Zelle`;
    const cutoffStatus = win.late ? `AFTER CUT-OFF — this is a request for ${win.pair}` : (win.holiday ? `Holiday rule: ${win.cutoffFull}` : `On time (window closes ${win.cutoffFull})`);

    const summaryBlock = [
      `REQUEST ${ref} · ${dayInfo.short} · ${method} · ${windowLabel(draft.window)}`,
      `${customer.name.trim()} · ${groupPhone(customer.phone)}${email ? ` · ${email}` : ''}`,
      ...lineSnap.map(lineText),
      `Subtotal ${subtotalText} · feeds ${feeds}${headcount ? ` · headcount ${headcount}` : ''}`,
      isDelivery ? `Deliver to: ${draft.address.trim()}${draft.address2.trim() ? ` (${draft.address2.trim()})` : ''}` : null,
      `Notes: ${draft.notes.trim() || 'none'}`,
      `Deposit: not yet · sent ${submittedLabel} · ${win.late ? 'AFTER CUT-OFF' : 'on time'}`,
    ].filter(Boolean).join('\n');

    const payload = {
      _subject: `${win.late ? 'LATE · ' : ''}${summary.hasQuote ? 'QUOTE · ' : ''}Order request ${ref} · ${dayInfo.short} · ${method} · ${plural(trayCount, 'tray')} · ${money(summary.subtotal)}`,
      ...(email ? { email, _replyto: email } : {}),
      _gotcha: ev.target.elements._gotcha?.value ?? '',
      Summary: summaryBlock,
      Reference: ref,
      Day: dayInfo.long ?? dayInfo.short,
      'Time window': windowLabel(draft.window),
      Method: method,
      ...(isDelivery ? { 'Delivery address': draft.address.trim() } : {}),
      ...(isDelivery && draft.address2.trim() ? { 'Delivery notes': draft.address2.trim() } : {}),
      Trays: trayText,
      'Tray count': String(trayCount),
      Feeds: feeds,
      Subtotal: subtotalText,
      Headcount: headcount ? String(headcount) : 'not given',
      name: customer.name.trim(),
      phone: groupPhone(customer.phone),
      Notes: draft.notes.trim() || 'none',
      Deposit: depositLine,
      'Submitted (ET)': submittedLabel,
      'Cut-off status': cutoffStatus,
      Page: `${SITE.url}#order`,
    };

    const result = await submitToFormspree(SITE.forms.orders, payload);
    setSending(false);
    if (!result.ok) { setSendError(result.error); return; }

    const record = {
      ref, submittedAt, submittedLabel,
      day: dayInfo, window: windowLabel(draft.window), method,
      address: isDelivery ? draft.address.trim() : '',
      lines: lineSnap, subtotal: summary.subtotal, hasQuote: summary.hasQuote,
      name: customer.name.trim(), phone: customer.phone.trim(), email,
      headcount, deposit: { status: 'none', at: null },
    };
    saveRequest(record);
    setReq(record);
    track('generate_lead', { currency: 'USD', value: Number(summary.subtotal), lead_type: 'order', fulfillment: method.toLowerCase(), item_count: trayCount, order_ref: ref });
    clearLines();
    setDraft({ day: '', window: '', method: '', address: '', address2: '', notes: '' });
    setPhase('sent');
    setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 50);
  };

  const onClaimed = () => {
    const next = { ...req, deposit: { status: 'manual_claimed', at: Date.now() } };
    setReq(next); saveRequest(next);
    addToast(`Thanks — ${SITE.owner} will match it when he confirms.`);
  };
  const onNew = () => { clearRequest(); setReq(null); setPhase('form'); setTimeout(() => focusHeading('menu'), 0); window.location.hash = '#menu'; };

  const errorList = Object.entries(errors).map(([id, message]) => ({ id, message }));
  const fieldErr = id => errors[id];
  const clearErr = id => setErrors(e => { if (!e[id]) return e; const n = { ...e }; delete n[id]; return n; });

  return (
    <section id="order" className="section order" aria-labelledby="order-heading">
      <div className="container-menu">
        {phase === 'paid' && (
          <Confirmation req={req} paid paidNoReq={!req?.lines?.length} headingRef={headingRef} onClaimed={onClaimed} onNew={onNew} />
        )}
        {phase === 'sent' && req && (
          <Confirmation req={req} quiet={ret === null && Boolean(session.get(KEYS.request)) && document.referrer.includes('stripe.com')} headingRef={headingRef} onClaimed={onClaimed} onNew={onNew} />
        )}
        {phase === 'form' && (
          <div className="order-grid">
            <div className="section-head">
              <h2 id="order-heading" tabIndex={-1} ref={headingRef}>Your order</h2>
              <p className="lede">Prefer to talk? Call <PhoneLink location="order_intro" /> and we'll take your order in five minutes.</p>
            </div>

            {lineCount > 0 && (
              <aside className="order-aside" aria-label="Your trays">
                <div className="order-summary-inline">
                  <h3>Your trays</h3>
                  <OrderLines />
                  <OrderTotals showDeposit={false} />
                </div>
              </aside>
            )}

            <div className="order-body">
              {lineCount === 0 ? (
                <div className="order-empty">
                  {req && <ResumeCard req={req} onNew={onNew} />}
                  <p>Nothing in your order yet.</p>
                  <div className="hero-ctas">
                    <Button href="#menu" size="lg" onClick={() => focusHeading('menu')}>See the menu</Button>
                    <PhoneLink button="secondary" size="lg" location="order_empty" label={`Call ${SITE.phone}`} />
                  </div>
                </div>
              ) : (
                <form className="order-form" noValidate onSubmit={onSubmit}>
                  <ErrorSummary errors={errorList} summaryRef={summaryRef} />

                  <RadioCardGroup id="order-day" name="day" legend="Which day?" value={draft.day} onChange={v => { setDraft({ day: v }); clearErr('order-day'); }}
                    options={dayOptions} error={fieldErr('order-day')}
                    hint={`Requests close Thursday ${win.cutoffLabel} ET. Smoked Friday night.${win.nextWeekend ? " This weekend's smoke is full — these are next weekend's dates." : ''}`} />

                  <RadioCardGroup id="order-window" name="window" legend="What time works?" value={draft.window} onChange={v => { setDraft({ window: v }); clearErr('order-window'); }}
                    options={WINDOWS} cols={3} error={fieldErr('order-window')} hint="We confirm the exact time with you." />

                  <RadioCardGroup id="order-method" name="method" legend="Pickup or delivery?" value={draft.method} onChange={v => { setDraft({ method: v }); clearErr('order-method'); }}
                    options={[
                      { value: 'pickup', title: 'Pickup — free', sub: `${PICKUP_AREA} · exact address in your confirmation` },
                      { value: 'delivery', title: 'Delivery', sub: `${SITE.serviceArea} · ${DELIVERY_FEE_SENTENCE}` },
                    ]} cols={2} error={fieldErr('order-method')} />

                  {isDelivery && (
                    <>
                      <TextField id="order-address" name="street-address" label="Delivery address" autoComplete="street-address"
                        value={draft.address} onChange={v => { setDraft({ address: v }); clearErr('order-address'); }} error={fieldErr('order-address')}
                        hint="Street, city and ZIP." />
                      <TextField id="order-address2" name="address-line2" label="Apartment, gate code, or where to leave it" optional autoComplete="address-line2"
                        value={draft.address2} onChange={v => setDraft({ address2: v })} />
                    </>
                  )}

                  <TextField id="order-name" name="name" label="Full name" autoComplete="name" value={customer.name}
                    onChange={v => { setCustomer({ name: v }); clearErr('order-name'); }} error={fieldErr('order-name')} />
                  <TextField id="order-phone" name="phone" label="Phone number" type="tel" autoComplete="tel" inputMode="tel" value={customer.phone}
                    onChange={v => { setCustomer({ phone: v }); clearErr('order-phone'); }} error={fieldErr('order-phone')}
                    hint={`We'll call or text this number to confirm.${outsideET ? ' (We\'re in Washington, DC — Eastern time.)' : ''}`} />
                  <TextField id="order-email" name="email" label="Email" optional type="email" autoComplete="email" inputMode="email" value={customer.email}
                    onChange={v => { setCustomer({ email: v }); clearErr('order-email'); }} error={fieldErr('order-email')}
                    hint="Your Stripe receipt goes here if you pay the deposit online. Skip it and we'll text or call." />

                  {notesOpen ? (
                    <TextArea id="order-notes" name="notes" label="Anything we should know?" optional value={draft.notes} onChange={v => setDraft({ notes: v })} maxLength={500}
                      hint="Allergies, sauce on the side, it's a 70th birthday…" />
                  ) : (
                    <p className="order-note-toggle"><button type="button" className="btn btn-tertiary btn-compact" onClick={() => setNotesOpen(true)}><Icon name="plus" size={18} />Add a note</button></p>
                  )}

                  <input type="text" name="_gotcha" className="gotcha" tabIndex={-1} aria-hidden="true" autoComplete="off" defaultValue="" />

                  <p className="deposit-sentence-form">{DEPOSIT_SENTENCE}</p>
                  {sendError && <Notice kind="error" role="alert">{sendError.split(SITE.phone)[0]}<a href={SITE.phoneHref} className="phone">{SITE.phone}</a>{sendError.split(SITE.phone)[1] ?? ''}</Notice>}
                  <Button type="submit" size="lg" mobileFull busy={sending}>Send my order request</Button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
