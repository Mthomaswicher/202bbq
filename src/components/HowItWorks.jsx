const STEPS = [
  {
    num: '01',
    title: 'Browse & Order',
    body: <>Browse the menu and add trays to your cart, then fill out the order form below. Or call <a href="tel:2027345621">202-734-5621</a>. Orders close <strong>Thursday night</strong>. Slots are limited.</>,
  },
  {
    num: '02',
    title: 'We Confirm',
    body: "You'll get a confirmation with your pickup location or delivery window, plus totals for any market-price items. No charge until we confirm.",
  },
  {
    num: '03',
    title: 'Overnight Smoke',
    body: 'Friday night we fire up the smoker. Low and slow, all night, until every piece is absolutely perfect.',
  },
  {
    num: '04',
    title: 'Pickup or Delivery',
    body: <>Your order is ready <strong>Saturday or Sunday</strong>. Pickup from us, delivered locally in the DMV, or shipped nationwide.</>,
  },
];

export default function HowItWorks() {
  return (
    <section className="hiw-section" aria-labelledby="hiw-heading">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">Simple as Smoke</p>
          <h2 className="section-title" id="hiw-heading">How to Get Your BBQ</h2>
        </div>

        <ol className="hiw-grid" role="list">
          {STEPS.map(step => (
            <li key={step.num} className="hiw-item">
              <div className="hiw-num" aria-hidden="true">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
