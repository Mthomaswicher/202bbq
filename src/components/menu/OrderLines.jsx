import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { money, optionSummary, feedsLabel, countLabel } from '../../lib/format.js';
import { DEPOSIT_SENTENCE, SITE } from '../../data/site.js';
import { focusHeading } from '../../lib/useScrollSpy.js';
import Picture from '../ui/Picture.jsx';
import Button from '../ui/Button.jsx';
import StatusLine from '../StatusLine.jsx';
import { QtyStepper, TrayKey } from './MenuSection.jsx';

/**
 * The one list of trays, shared by the order rail (desktop), the summary at
 * the top of #order, and the confirmation recap (read-only).
 */
export function OrderLines({ readOnly = false, compact = false }) {
  const { lines, setQty, remove, restoreLine } = useCart();
  const { addToast } = useToast();

  const onRemove = line => {
    const removed = remove(line.item.id, line.option.id);
    if (removed) addToast(`${line.item.name} removed`, { action: { label: 'Undo', onClick: () => restoreLine(removed) } });
  };

  return (
    <ul className={`orderlines${compact ? ' compact' : ''}`}>
      {lines.map(line => {
        const isQuote = line.option.pricing === 'quote';
        const lineTotal = isQuote ? null : line.option.price * line.qty;
        return (
          <li key={line.key} className="orderline">
            {line.item.image && !compact && <Picture name={line.item.image} alt="" sizes="48px" className="orderline-thumb" />}
            <div className="orderline-main">
              <span className="orderline-name">{line.qty}× {line.item.name}</span>
              <span className="orderline-opt small muted">
                {optionSummary(line.option)}
                {line.option.unit && ` · ${money(line.option.price)} each`}
              </span>
              {!readOnly && (
                <div className="orderline-controls">
                  <QtyStepper item={line.item} option={line.option} qty={line.qty} onChange={n => (n === 0 ? onRemove(line) : setQty(line.item.id, line.option.id, n))} showInOrder={false} />
                  <button type="button" className="btn btn-danger-text btn-compact" onClick={() => onRemove(line)}>Remove</button>
                </div>
              )}
            </div>
            <span className="orderline-price price">{isQuote ? <span className="small">market price</span> : money(lineTotal)}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function OrderTotals({ showDeposit = true }) {
  const { summary, headcount } = useCart();
  const under = headcount && summary.feedsHi && headcount > summary.feedsHi;
  return (
    <div className="ordertotals">
      {summary.feedsHi > 0 && (
        <p className="ordertotals-feeds small muted">
          These trays {feedsLabel(summary).replace('feeds', 'feed about')}{summary.units ? `, plus ${summary.units} ${summary.unitLabel}${summary.units === 1 ? '' : 's'}` : ''}.
        </p>
      )}
      {under && <p className="ordertotals-note small">You're feeding {headcount} — want to add a side?</p>}
      <p className="ordertotals-subtotal"><span>Subtotal</span><span className="price">{money(summary.subtotal)}</span></p>
      {summary.hasQuote && <p className="small muted">+ market-price items, quoted on confirmation</p>}
      {showDeposit && <p className="small deposit-sentence">{DEPOSIT_SENTENCE}</p>}
    </div>
  );
}

/** Desktop rail beside the menu. */
export function OrderRail() {
  const { lineCount, summary } = useCart();
  return (
    <div className="orderrail-panel">
      <h3 className="orderrail-title">Your order</h3>
      <StatusLine className="orderrail-status" />
      {lineCount === 0 ? (
        <div className="orderrail-empty">
          <p>Nothing yet — trays go here.</p>
          <TrayKey compact />
        </div>
      ) : (
        <>
          <OrderLines />
          <OrderTotals />
          <Button href="#order" size="lg" full onClick={() => focusHeading('order')} iconRight="arrowRight">Review order</Button>
          <p className="small muted orderrail-phone">Prefer to talk? Call <a href={SITE.phoneHref} className="phone">{SITE.phone}</a>.</p>
        </>
      )}
    </div>
  );
}

export { countLabel };
