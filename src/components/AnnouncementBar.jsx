export default function AnnouncementBar() {
  const day = new Date().getDay(); // 0=Sun … 6=Sat
  const isOpen = day >= 1 && day <= 4;

  return (
    <div className="announcement-bar" role="status" aria-label="Site announcement">
      <p>
        {isOpen
          ? <><strong>Orders are open!</strong> Order Mon–Thu for Sat &amp; Sun pickup or delivery &nbsp;·&nbsp;</>
          : <>Order window closed. Reopens Monday &nbsp;·&nbsp;</>
        }
        <a href="tel:2029978912">202-997-8912</a>
        &nbsp;·&nbsp;
        <a href="#order">Order Online →</a>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        🚚 <a href="#shipping"><strong>Oxtail Softballs ship nationwide →</strong></a>
      </p>
    </div>
  );
}
