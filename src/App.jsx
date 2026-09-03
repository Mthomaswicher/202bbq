import { CartProvider, useCart } from './context/CartContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { splitEvents } from './data/events.js';
import { nowET } from './lib/time.js';
import SiteHeader from './components/SiteHeader.jsx';
import Hero from './components/Hero.jsx';
import MenuSection, { OrderBar } from './components/menu/MenuSection.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import OrderSection from './components/order/OrderSection.jsx';
import CateringSection from './components/CateringSection.jsx';
import ShippingSection from './components/ShippingSection.jsx';
import ReviewsSection from './components/ReviewsSection.jsx';
import AboutSection from './components/AboutSection.jsx';
import EventsSection from './components/EventsSection.jsx';
import FaqSection from './components/FaqSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import Footer from './components/Footer.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import { Divider } from './components/ui/Bits.jsx';

function LiveRegion() {
  const { announcement } = useCart();
  return <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>;
}

export default function App() {
  const { upcoming } = splitEvents(nowET().ymd);
  return (
    <ThemeProvider>
      <ToastProvider>
        <CartProvider>
          <a href="#menu" className="skip-link">Skip to menu</a>
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <SiteHeader hasUpcomingEvents={upcoming.length > 0} />
          <main id="main-content">
            <Hero />
            <Divider />
            <MenuSection />
            <HowItWorks />
            <OrderSection />
            <Divider />
            <CateringSection />
            <ShippingSection />
            <ReviewsSection />
            <Divider />
            <AboutSection />
            <EventsSection />
            <FaqSection />
            <ContactSection />
            <OrderBar />
          </main>
          <Footer />
          <ToastContainer />
          <LiveRegion />
        </CartProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
