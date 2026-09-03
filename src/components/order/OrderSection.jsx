import { useEffect, useMemo, useRef, useState } from 'react';
import { SITE, DEPOSIT_SENTENCE, CANCEL_TERMS, PICKUP_AREA, DELIVERY_FEE_SENTENCE } from '../../data/site.js';
import { getItem, getOption } from '../../data/menu.js';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { money, feedsRange, groupPhone, phoneDigits, maskEmail, summarise, plural, countLabel, subtotalLabel } from '../../lib/format.js';
import { makeRef, stampET, stampETFull, nowET, visitorOutsideET, fmtLong } from '../../lib/time.js';
import { submitToFormspree } from '../../lib/formspree.js';
import { buildDepositUrl, readDepositReturn, loadRequest, saveRequest, clearRequest } from '../../lib/depositReturn.js';
import { session, KEYS } from '../../lib/storage.js';
import { track } from '../../lib/analytics.js';
import { focusHeading } from '../../lib/useScrollSpy.js';
import { useOrderWindow } from '../StatusLine.jsx';
import { OrderLines, OrderTotals } from '../menu/OrderLines.jsx';
import { TextField, TextArea, RadioCardGroup, ErrorSummary, Notice } from '../ui/Field.jsx';
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
const DEPOSIT_STARTED = '202bbq.depositStarted';

function lineText(l) {
  const item = getItem(l.itemId), option = getOption(l.itemId, l.optionId);
  if (!item || !option) return '';
  if (option.pricing === 'quote') return `${l.qty}× ${item.name} — ${option.label} (${feedsRange(option.feeds)}) — market price`;
  if (option.unit) return `${l.qty}× ${item.name} — per ${option.unit} (${option.minQty ?? 1} minimum) — ${money(option.price * l.qty)} (${money(option.price)} each)`;
  return `${l.qty}× ${item.name} — ${option.label} (${feedsRange(option.feeds)}) — ${money(option.price * l.qty)}`;
}
const linesSummary = lines => summarise(lines.map(l => ({ option: getOption(l.itemId, l.optionId) ?? { feeds: [0, 0], price: 0 }, qty: l.qty })));

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

function markDepositStarted(ref) { session.set(DEPOSIT_STARTED, ref); }

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
          <Button href={url} size="lg" mobileFull onClick={() => { markDepositStarted(req.ref); track('begin_checkout', { currency: 'USD', value: SITE.depositAmount, payment_method: 'stripe', order_ref: req.ref }); }}>
            Pay the ${SITE.depositAmount} deposit
          </Button>
          <p className="small muted">Card, Apple Pay, Google Pay. Refunded in full if we can’t fill your request.</p>
        </>
      ) : (
        <p>{SITE.owner} will text you a secure payment link, or take Cash App, Venmo or Zelle.</p>
      )}
      {quiet && <p className="small deposit-quiet">Deposit not paid yet — that’s fine, you can pay when {SITE.owner} calls.</p>}
      {handles.length > 0 && (
        <div className="handles">
          <p className="small">Or send ${SITE.depositAmount} by:</p>
          <ul>
            {handles.map(h => (
              <li key={h.label} className="copy-row">
                <span><strong>{h.label}</strong> <code>{h.value}</code></span>
                <CopyButton text={h.value} onCopied={() => onCopied(`${h.label} copied`)} aria-label={`Copy ${h.label} ${h.value}`} />
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
  const sum = req?.lines ? linesSummary(req.lines) : null;
  const balance = sum ? Math.max(0, sum.subtotal - SITE.depositAmount) : 0;
  const quoteTail = req?.hasQuote ? ', plus the market-price items we quote' : '';
  const dayLong = req?.day?.long;
  const delivery = req?.method === 'Delivery';
  const dayPhrase = dayLong ?? null;

  const summaryText = req ? [
    `REQUEST ${req.ref} · ${req.day?.short ?? 'Day not set'} · ${req.method} · ${req.window ?? ''}`,
    `${req.name} · ${groupPhone(req.phone)}${req.email ? ` · ${req.email}` : ''}`,
    ...req.lines.map(lineText),
    `Subtotal ${req.subtotal > 0 ? money(req.subtotal) : 'market price'}${req.hasQuote && req.subtotal > 0 ? ' + market-price items' : ''}${sum?.feedsHi ? ` · feeds about ${sum.feedsLo}–${sum.feedsHi}` : ''}`,
    `$${SITE.depositAmount} deposit: ${url ?? `${SITE.owner} will text you a payment link`}`,
    `Questions: ${SITE.phone}`,
  ].join('\n') : '';
  const mailto = req?.email ? `mailto:${encodeURIComponent(req.email)}?subject=${encodeURIComponent(`Your 202BBQ request ${req.ref} · ${req.day?.short ?? ''}`)}&body=${encodeURIComponent(summaryText)}` : null;
  const sms = `${SITE.smsHref}?body=${encodeURIComponent(`Hi ${SITE.owner}, about request ${req?.ref ?? ''}`)}`;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ics = req?.day?.ymd ? `data:text/calendar;charset=utf-8,${encodeURIComponent([
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//202BBQ//EN', 'BEGIN:VEVENT',
    `UID:${req.ref}@202barbecue.com`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${req.day.ymd.replace(/-/g, '')}`,
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
          <p className="ref-line">
            <span>Request <strong className="mono">{req.ref}</strong></span>
            <CopyButton text={req.ref} label="Copy" onCopied={() => addToast('Reference copied')} className="ref-copy" aria-label={`Copy reference ${req.ref}`} />
          </p>
          <p className="ref-meta small muted">
            {dayLong && <><span className="nowrap">{dayLong}</span> · </>}
            <span className="nowrap">{req.method}</span> · <span className="nowrap">sent {req.submittedLabel}</span>
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
                <p>{SITE.owner} calls or emails you within a few hours (Mon–Thu). Your trays are reserved once {SITE.owner} confirms.</p>
              </div>
            </li>
            <li>
              <span className="step-num" aria-hidden="true">2</span>
              <div>
                {paid ? (
                  <>
                    <p className="step-title"><Icon name="check" size={20} /> You paid the ${SITE.depositAmount} deposit.</p>
                    <p>{req.subtotal > 0 ? `Balance ${money(balance)} at ${delivery ? 'delivery' : 'pickup'}${quoteTail}.` : `The balance is due at ${delivery ? 'delivery' : 'pickup'} once we’ve quoted your market-price items.`}</p>
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
                    ? (dayPhrase
                      ? <>We deliver {dayPhrase}, between {SITE.fulfilHours.open} and {SITE.fulfilHours.close} — we’ll agree the hour with you.</>
                      : <>We deliver on the day and hour we agree, between {SITE.fulfilHours.open} and {SITE.fulfilHours.close}.</>)
                    : (dayPhrase
                      ? <>Pick up {dayPhrase} at the time we agree — the address is in your confirmation call or text.</>
                      : <>Pick up on the day and time we agree — the address is in your confirmation call or text.</>)}
                </p>
              </div>
            </li>
          </ol>

          <h3>Your trays</h3>
          <RecapLines lines={req.lines} />
          <p className="ordertotals-subtotal"><span>Subtotal</span><span className="price">{req.subtotal > 0 ? money(req.subtotal) : 'Market price'}</span></p>
          {req.hasQuote && req.subtotal > 0 && <p className="small muted">+ market-price items, quoted on confirmation</p>}
          {!paid && req.subtotal > 0 && <p className="small muted">Balance at {delivery ? 'delivery' : 'pickup'}: {money(balance)} after the deposit{quoteTail}.</p>}

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
  const what = countLabel(linesSummary(req.lines)) || 'your trays';
  const unpaid = !req.deposit || req.deposit.status === 'none';
  return (
    <div className="resume-card">
      <p>Your request from {when}, <strong className="mono">{req.ref}</strong> ({req.day?.short ?? req.method} · {what}), is with {SITE.owner} — he’ll call to confirm.</p>
      {!unpaid && <p className="small muted">Deposit {req.deposit.status === 'stripe_returned' ? 'paid' : 'sent'} — thank you.</p>}
      <ul className="confirm-actions">
        {url && unpaid && <li><Button href={url} size="compact" onClick={() => markDepositStarted(req.ref)}>Pay the ${SITE.depositAmount} deposit</Button></li>}
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
  const [req, setReq] = useState(() => loadRequest(ret ? (ret.ref ?? '__none__') : undefined));
  const [phase, setPhase] = useState(() => {
    if (ret) return 'paid';
    if (req?.deposit?.status === 'stripe_returned') return 'paid';
    if (req && session.get(KEYS.request)) return 'sent';
    return 'form';
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [notesOpen, setNotesOpen] = useState(Boolean(draft.notes));
  const [startedRef, setStartedRef] = useState(() => session.get(DEPOSIT_STARTED));
  const headingRef = useRef(null);
  const summaryRef = useRef(null);
  const outsideET = visitorOutsideET();

  // Returned from Stripe: record it, announce it, scroll here (quiet focus — no ring on a page-load focus).
  useEffect(() => {
    if (!ret) return;
    if (req) { const next = { ...req, deposit: { status: 'stripe_returned', at: Date.now() } }; setReq(next); saveRequest(next); }
    session.remove(DEPOSIT_STARTED);
    track('purchase', { value: SITE.depositAmount, currency: 'USD', order_ref: ret.ref ?? req?.ref ?? '' });
    setTimeout(() => {
      document.getElementById('order')?.scrollIntoView();
      const h = headingRef.current;
      if (h) { h.classList.add('focus-quiet'); h.focus({ preventScroll: true }); h.addEventListener('blur', () => h.classList.remove('focus-quiet'), { once: true }); }
    }, 50);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Back from Stripe without paying (bfcache restore or a normal reload): show the quiet line.
  useEffect(() => {
    const onShow = () => setStartedRef(session.get(DEPOSIT_STARTED));
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  const isDelivery = draft.method === 'delivery';
  const dayOptions = useMemo(() => ([
    ...win.dates.map(d => ({ value: d.ymd, title: d.long, sub: win.holiday ? 'Holiday pickup' : win.nextWeekend ? 'Next weekend' : 'This weekend' })),
    { value: 'unsure', title: 'Not sure — call me', sub: 'We’ll pick a day together' },
  ]), [win]);

  const validate = () => {
    const e = {};
    if (!draft.day) e['order-day'] = 'Choose Saturday, Sunday, or “Not sure — call me”.';
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
      setTimeout(() => { summaryRef.current?.scrollIntoView({ block: 'start' }); summaryRef.current?.focus({ preventScroll: true }); }, 0);
      return;
    }
    document.title = document.title.replace(/^Error: /, '');
    setSending(true);

    const now = nowET();
    const ref = makeRef(now);
    const submittedAt = Date.now();
    const submittedLabel = stampET();
    const dayInfo = draft.day === 'unsure'
      ? { ymd: null, short: 'Day not set', long: null }
      : (win.dates.find(d => d.ymd === draft.day) ?? { ymd: draft.day, short: fmtLong(draft.day), long: fmtLong(draft.day) });
    const method = isDelivery ? 'Delivery' : 'Pickup';
    const lineSnap = lines.map(l => ({ itemId: l.item.id, optionId: l.option.id, qty: l.qty }));
    const trayText = lineSnap.map(lineText).join('\n');
    const feeds = summary.feedsHi ? `about ${summary.feedsLo}–${summary.feedsHi}` : summary.units ? `${summary.units} ${summary.unitLabel}s, no trays` : 'quoted items only';
    const email = customer.email.trim();
    const subtotalText = summary.subtotal > 0
      ? `${money(summary.subtotal)}${summary.hasQuote ? ' + market-price items (quote before confirming)' : ''}`
      : 'market-price items only (quote before confirming)';
    const count = countLabel(summary) || 'no trays';
    const depositLine = SITE.stripeDepositUrl
      ? `Not yet at time of request — look for ${email || customer.name.trim()} in Stripe, or the note "202BBQ ${ref}" in Cash App/Venmo/Zelle`
      : `Not yet — text the customer a payment link, or look for the note "202BBQ ${ref}" in Cash App/Venmo/Zelle`;
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
      _subject: `${win.late ? 'LATE · ' : ''}${summary.hasQuote ? 'QUOTE · ' : ''}Order request ${ref} · ${dayInfo.short} · ${method} · ${count} · ${subtotalLabel(summary)}`,
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
      'Tray count': count,
      Feeds: feeds,
      Subtotal: subtotalText,
      Headcount: headcount ? String(headcount) : 'not given',
      name: customer.name.trim(),
      phone: groupPhone(customer.phone),
      Notes: draft.notes.trim() || 'none',
      Deposit: depositLine,
      'Submitted (ET)': stampETFull(),
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
    session.remove(DEPOSIT_STARTED);
    setStartedRef(null);
    setReq(record);
    track('generate_lead', { currency: 'USD', value: Number(summary.subtotal), lead_type: 'order', fulfillment: method.toLowerCase(), item_count: summary.trays + summary.units, order_ref: ref });
    clearLines();
    setDraft({ day: '', window: '', method: '', address: '', address2: '', notes: '' });
    setPhase('sent');
    setTimeout(() => { document.getElementById('order')?.scrollIntoView(); headingRef.current?.focus({ preventScroll: true }); }, 50);
  };

  const onClaimed = () => {
    const next = { ...req, deposit: { status: 'manual_claimed', at: Date.now() } };
    setReq(next); saveRequest(next);
    addToast(`Thanks — ${SITE.owner} will match it when he confirms.`);
  };
  const onNew = () => { clearRequest(); session.remove(DEPOSIT_STARTED); setReq(null); setPhase('form'); window.location.hash = '#menu'; setTimeout(() => focusHeading('menu'), 0); };

  const errorList = Object.entries(errors).map(([id, message]) => ({ id, message }));
  const fieldErr = id => errors[id];
  const clearErr = id => setErrors(e => { if (!e[id]) return e; const n = { ...e }; delete n[id]; return n; });
  const quiet = !ret && req?.deposit?.status === 'none' && startedRef === req?.ref;

  return (
    <section id="order" className="section order" aria-labelledby="order-heading">
      <div className="container-menu">
        {phase === 'paid' && (
          <Confirmation req={req} paid paidNoReq={!req?.lines?.length} headingRef={headingRef} onClaimed={onClaimed} onNew={onNew} />
        )}
        {phase === 'sent' && req && (
          <Confirmation req={req} quiet={quiet} headingRef={headingRef} onClaimed={onClaimed} onNew={onNew} />
        )}
        {phase === 'form' && (
          <div className="order-grid">
            <div className="section-head">
              <h2 id="order-heading" tabIndex={-1} ref={headingRef}>Your order</h2>
              <p className="lede">Prefer to talk? Call <PhoneLink location="order_intro" /> and we’ll take your order over the phone.</p>
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
                    hint={win.holiday && SITE.announcement?.text
                      ? SITE.announcement.text
                      : `Requests close Thursday ${win.cutoffLabel} ET. Smoked Friday night.${win.nextWeekend ? ' This weekend’s smoke is full — these are next weekend’s dates.' : ''}`} />

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
                    hint={`We’ll call or text this number to confirm.${outsideET ? ' (We’re in Washington, DC — Eastern time.)' : ''}`} />
                  <TextField id="order-email" name="email" label="Email" optional type="email" autoComplete="email" inputMode="email" value={customer.email}
                    onChange={v => { setCustomer({ email: v }); clearErr('order-email'); }} error={fieldErr('order-email')}
                    hint="Your receipt goes here if you pay the deposit online. Skip it and we’ll text or call." />

                  {notesOpen ? (
                    <TextArea id="order-notes" name="notes" label="Anything we should know?" optional value={draft.notes} onChange={v => setDraft({ notes: v })} maxLength={500}
                      hint="Allergies, sauce on the side, it’s a 70th birthday…" />
                  ) : (
                    <p className="order-note-toggle"><button type="button" className="btn btn-tertiary btn-compact" onClick={() => setNotesOpen(true)}><Icon name="plus" size={18} />Add a note</button></p>
                  )}

                  <input type="text" name="_gotcha" className="gotcha" tabIndex={-1} aria-hidden="true" autoComplete="off" defaultValue="" />

                  <p className="deposit-sentence-form">
                    <span>{DEPOSIT_SENTENCE}</span>
                    <span className="deposit-phone">Prefer to talk? Call <PhoneLink location="order_deposit" /> and we’ll take it by phone.</span>
                  </p>
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
