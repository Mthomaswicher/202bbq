import { useEffect, useState } from 'react';
import { GROUPS, MENU_ITEMS, TRAY_KEY, itemsInGroup } from '../../data/menu.js';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { money, feedsRange, perPerson, plural } from '../../lib/format.js';
import { useScrollSpy, focusHeading } from '../../lib/useScrollSpy.js';
import { SITE } from '../../data/site.js';
import Picture from '../ui/Picture.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { PhoneLink, Tag } from '../ui/Bits.jsx';
import { TextField } from '../ui/Field.jsx';
import StatusLine from '../StatusLine.jsx';
import { OrderRail } from './OrderLines.jsx';

/* ---------- Category nav: 3+2 chip grid < 640, one row 640–1439, left rail ≥ 1440 ---------- */
function chromeTop() {
  if (typeof window === 'undefined') return 0;
  const w = window.innerWidth, h = window.innerHeight;
  if (w >= 1440) return 72 + 24;
  if (w >= 1024) return 72 + 48;
  if (w >= 640) return 56 + 48;
  if (h <= 640) return 56;
  return 93;
}

export function CategoryNav() {
  const active = useScrollSpy(GROUPS.map(g => `menu-${g.id}`), { topInset: chromeTop, bottom: '-55%' });
  return (
    <nav id="menu-categories" className="catnav" aria-label="Menu categories">
      <ul>
        {GROUPS.map(g => (
          <li key={g.id}>
            <a href={`#menu-${g.id}`} aria-label={g.name} aria-current={active === `menu-${g.id}` ? 'true' : undefined}
              onClick={() => focusHeading(`menu-${g.id}`)}>
              <span>
                <span className="short">{g.short}</span>
                <span className="full">{g.name}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ---------- Headcount helper ---------- */
const HEADCOUNTS = [10, 20, 40, 60, 100];
function HeadcountHelper() {
  const { headcount, setHeadcount } = useCart();
  const [mode, setMode] = useState(() => (headcount && !HEADCOUNTS.includes(headcount) ? 'type' : 'pick'));
  const [typed, setTyped] = useState(headcount && !HEADCOUNTS.includes(headcount) ? String(headcount) : '');

  const hint = (() => {
    if (!headcount) return 'Pick a number and we\'ll suggest how much to order.';
    if (headcount >= 100) return <>For 100 or more, <a href="#catering" onClick={() => focusHeading('catering')}>get an event quote</a> — we can do drop-off or full service.</>;
    if (headcount <= 15) return `For ${headcount} people: one half tray of a meat plus one half tray of a side is plenty.`;
    if (headcount <= 25) return `For ${headcount} people: one full tray of a meat plus a half tray of a side, or two half trays of each.`;
    const fullTrays = Math.max(1, Math.round(headcount / 35));
    return `For ${headcount} people: ${plural(fullTrays, 'full tray')} of a meat plus ${plural(fullTrays, 'full tray')} of a side is plenty. Two half trays equal one full.`;
  })();

  return (
    <fieldset className="headcount">
      <legend>How many people are you feeding?</legend>
      <div className="radio-chips">
        {HEADCOUNTS.map(n => (
          <label key={n} className="radio-chip">
            <input type="radio" name="headcount" className="sr-only" value={n} checked={mode === 'pick' && headcount === n}
              onChange={() => { setMode('pick'); setHeadcount(n); }} />
            <span>{n === 100 ? '100+' : n}</span>
          </label>
        ))}
        <label className="radio-chip">
          <input type="radio" name="headcount" className="sr-only" value="type" checked={mode === 'type'}
            onChange={() => { setMode('type'); if (typed) setHeadcount(Number(typed)); }} />
          <span>I'll type it</span>
        </label>
      </div>
      {mode === 'type' && (
        <div className="headcount-typed">
          <TextField label="Number of people" value={typed} inputMode="numeric" autoComplete="off" name="headcount-number"
            onChange={v => { const digits = v.replace(/\D/g, '').slice(0, 4); setTyped(digits); setHeadcount(digits ? Number(digits) : null); }} />
        </div>
      )}
      <p className="hint headcount-hint" aria-live="polite">{hint}</p>
    </fieldset>
  );
}

/* ---------- Tray key ---------- */
export function TrayKey({ compact = false }) {
  return (
    <ul className={`traykey${compact ? ' compact' : ''}`} aria-label="Tray sizes">
      {TRAY_KEY.map(t => (
        <li key={t.id}>
          <Icon name={t.id === 'full' ? 'tray' : 'halfTray'} />
          <span className="mono">{t.label} · {feedsRange(t.feeds)}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Quantity stepper ---------- */
export function QtyStepper({ item, option, qty, onChange, showInOrder = true }) {
  const min = option.minQty ?? 1;
  const unit = option.unit ? `${option.unit}${qty === 1 ? '' : 's'}` : option.label.toLowerCase();
  const decLabel = qty <= min
    ? `Remove ${item.name}${option.unit ? '' : ` ${option.label.toLowerCase()}`} from your order`
    : `Remove one ${item.name} ${option.unit ?? option.label.toLowerCase()}`;
  return (
    <div className="stepper" role="group" aria-label={`${item.name}, ${option.unit ? 'per ' + option.unit : option.label.toLowerCase()}, quantity`}>
      <button type="button" className="btn btn-icon" aria-label={decLabel} onClick={() => onChange(qty <= min ? 0 : qty - 1)}>
        <Icon name={qty <= min ? 'x' : 'minus'} />
      </button>
      <output aria-live="polite" aria-atomic="true">{qty}<span className="sr-only"> {unit}</span></output>
      <button type="button" className="btn btn-icon" aria-label={`Add one ${item.name} ${option.unit ?? option.label.toLowerCase()}`} onClick={() => onChange(qty + 1)}>
        <Icon name="plus" />
      </button>
      {showInOrder && <span className="in-order">In your order</span>}
    </div>
  );
}

/* ---------- One option line inside a row ---------- */
function OptionLine({ item, option }) {
  const { qtyOf, add, setQty } = useCart();
  const qty = qtyOf(item.id, option.id);
  const isQuote = option.pricing === 'quote';
  const isUnit = Boolean(option.unit);
  const minQty = option.minQty ?? 1;
  const pp = perPerson(option);

  let feedsLine;
  if (isQuote) feedsLine = `${feedsRange(option.feeds)} · market price — we quote before you commit`;
  else if (isUnit) feedsLine = `minimum ${minQty} — we confirm the count with you`;
  else feedsLine = `${feedsRange(option.feeds)}${pp ? ` · ${pp}` : ''}`;

  const priceCell = isQuote
    ? <span className="opt-price is-quote">Market price</span>
    : <span className="opt-price price">{money(option.price)}</span>;

  let action;
  if (qty > 0) {
    action = <QtyStepper item={item} option={option} qty={qty} onChange={n => setQty(item.id, option.id, n)} />;
  } else if (isQuote) {
    action = (
      <div className="opt-actions">
        <Button variant="secondary" onClick={() => add(item.id, option.id)} aria-label={`Add ${option.label.toLowerCase()} of ${item.name}, price quoted`}>Add · price quoted</Button>
        <a href={SITE.phoneHref} className="btn btn-tertiary btn-compact">Call for today's price</a>
      </div>
    );
  } else if (isUnit) {
    action = <Button onClick={() => add(item.id, option.id)} aria-label={`Add ${minQty} ${item.name.toLowerCase()}, ${money(option.price * minQty)}`}>Add {minQty} {option.unit}s · {money(option.price * minQty)}</Button>;
  } else {
    action = <Button onClick={() => add(item.id, option.id)} aria-label={`Add ${option.label.toLowerCase()} of ${item.name}, ${money(option.price)}`}>Add {option.label.toLowerCase()} · {money(option.price)}</Button>;
  }

  return (
    <li className={`opt${qty > 0 ? ' in-order' : ''}`}>
      <div className="opt-label">
        <span className="opt-name">{option.label}</span>
        <span className="opt-feeds">{feedsLine}</span>
      </div>
      <span className="opt-leader" aria-hidden="true" />
      {priceCell}
      <div className="opt-action">{action}</div>
    </li>
  );
}

/* ---------- Menu row ---------- */
function MenuItemRow({ item }) {
  const hid = `item-${item.id}`;
  const contains = [item.contains, ...(item.allergens ?? [])].filter(Boolean);
  return (
    <article className="row" aria-labelledby={hid}>
      <div className="row-head">
        <div className="row-text">
          <h4 id={hid}>{item.name}</h4>
          <p className="row-desc">{item.desc}</p>
          {(item.tags?.length || contains.length) ? (
            <div className="tag-list">
              {item.tags?.map(t => <Tag key={t}>{t}</Tag>)}
              {contains.length > 0 && <span className="small muted contains">Contains: {contains.join(', ')}</span>}
            </div>
          ) : null}
        </div>
        {item.image && (
          <Picture name={item.image} alt="" sizes="(min-width: 1024px) 96px, 80px" className="row-photo" />
        )}
      </div>
      <ul className="row-options">
        {item.options.map(o => <OptionLine key={o.id} item={item} option={o} />)}
      </ul>
    </article>
  );
}

/* ---------- Group end strip ---------- */
function GroupEndStrip({ group, next }) {
  const { lineCount } = useCart();
  return (
    <div className="group-end">
      {next ? (
        <a href={`#menu-${next.id}`} className="group-next" onClick={() => focusHeading(`menu-${next.id}`)}>
          Next: {next.name} <Icon name="arrowDown" size={20} />
        </a>
      ) : (
        <span className="group-done">You've seen the whole menu</span>
      )}
      <a href="#menu-categories" className="group-all">All categories <Icon name="arrowUp" size={20} /></a>
      {next ? (
        <a href={SITE.phoneHref} className="group-call"><Icon name="phone" size={20} /> Call <span className="phone">{SITE.phone}</span></a>
      ) : (
        lineCount > 0
          ? <a href="#order" className="group-review" onClick={() => focusHeading('order')}>Review your order <Icon name="arrowRight" size={20} /></a>
          : <a href={SITE.phoneHref} className="group-call"><Icon name="phone" size={20} /> Call <span className="phone">{SITE.phone}</span></a>
      )}
    </div>
  );
}

/* ---------- Group ---------- */
function MenuGroup({ group, next }) {
  const items = itemsInGroup(group.id);
  return (
    <section id={`menu-${group.id}`} className="menu-group" aria-labelledby={`menu-${group.id}-heading`}>
      <div className="group-head">
        <h3 id={`menu-${group.id}-heading`} tabIndex={-1}>{group.name} <span className="group-count">· {plural(items.length, 'item')}</span></h3>
        {group.blurb && <p className="group-blurb">{group.blurb}</p>}
      </div>
      <div className="rows">
        {items.map(item => <MenuItemRow key={item.id} item={item} />)}
      </div>
      <GroupEndStrip group={group} next={next} />
    </section>
  );
}

/* ---------- Restore line ---------- */
function RestoreLine() {
  const { restoredOld, restoredAt, lineCount, summary, clearLines, dismissRestore } = useCart();
  if (!restoredOld) return null;
  const when = new Date(restoredAt).toLocaleDateString('en-US', { weekday: 'long', timeZone: SITE.cutoff.tz });
  const what = summary.trays ? plural(summary.trays, 'tray') : plural(lineCount, 'item');
  return (
    <p className="restore-line" role="status">
      <span>We kept the {what} you picked on {when}.</span>
      <button type="button" className="btn btn-tertiary btn-compact" onClick={() => { clearLines(); dismissRestore(); }}>Clear</button>
    </p>
  );
}

/* ---------- The section ---------- */
export default function MenuSection() {
  return (
    <section id="menu" className="section menu" aria-labelledby="menu-heading">
      <div className="container-menu">
        <div className="menu-intro">
          <h2 id="menu-heading" tabIndex={-1}>Order by the tray</h2>
          <p className="lede">Everything is smoked the night before. Full tray feeds 30–40, half tray feeds 15–20.</p>
          <StatusLine et withPhone />
          <RestoreLine />
        </div>

        <div className="menu-layout">
          <div className="menu-list">
            <CategoryNav />
            <div className="menu-tools">
              <HeadcountHelper />
              <TrayKey />
            </div>
            {GROUPS.map((g, i) => <MenuGroup key={g.id} group={g} next={GROUPS[i + 1]} />)}
          </div>
          <aside className="orderrail" aria-label="Your order">
            <OrderRail />
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ---------- Mobile order bar (rendered in App, fixed) ---------- */
export function OrderBar() {
  const { lineCount, summary } = useCart();
  const [orderInView, setOrderInView] = useState(false);
  useEffect(() => {
    const el = document.getElementById('order');
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setOrderInView(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const show = lineCount > 0 && !orderInView;
  useEffect(() => {
    document.body.classList.toggle('has-orderbar', show);
    return () => document.body.classList.remove('has-orderbar');
  }, [show]);
  if (!show) return null;
  const count = [summary.trays && plural(summary.trays, 'tray'), summary.units && plural(summary.units, summary.unitLabel)].filter(Boolean).join(' + ');
  const feeds = summary.feedsHi ? ` · feeds ${summary.feedsLo}–${summary.feedsHi}` : '';
  return (
    <a href="#order" className="orderbar" onClick={() => focusHeading('order')}
      aria-label={`Review your order: ${count}${feeds}, ${money(summary.subtotal)}`}>
      <span className="orderbar-text">
        <span className="orderbar-title">Review your order ›</span>
        <span className="orderbar-sub">{count}{feeds}</span>
      </span>
      <span className="orderbar-total price">{money(summary.subtotal)}</span>
    </a>
  );
}

export { MENU_ITEMS };
