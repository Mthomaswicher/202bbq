import { CartProvider } from './context/CartContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import AnnouncementBar from './components/AnnouncementBar.jsx';
import Header from './components/Header.jsx';
import HeroSection from './components/HeroSection.jsx';
import EventsSection from './components/EventsSection.jsx';
import MenuSection from './components/MenuSection.jsx';
import AboutSection from './components/AboutSection.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import FaqSection from './components/FaqSection.jsx';
import OrderSection from './components/OrderSection.jsx';
import ReviewSection from './components/ReviewSection.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import ToastContainer from './components/ToastContainer.jsx';

export default function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <AnnouncementBar />
        <Header />
        <CartDrawer />
        <ToastContainer />
        <main id="main-content">
          <HeroSection />
          <EventsSection />
          <MenuSection />
          <AboutSection />
          <HowItWorks />
          <FaqSection />
          <OrderSection />
          <ReviewSection />
        </main>
        <Footer />
      </CartProvider>
    </ToastProvider>
  );
}
