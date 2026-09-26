import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { SkincareQuiz } from './components/SkincareQuiz';
import { RitualTimerModal } from './components/RitualTimerModal';
import { SkinConciergeChat } from './components/SkinConciergeChat';
import { QuickViewModal } from './components/QuickViewModal';
import { ToastContainer } from './components/Toast';

import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { AboutView } from './views/AboutView';
import { JournalView } from './views/JournalView';
import { ContactView } from './views/ContactView';
import { CheckoutView } from './views/CheckoutView';

import './styles/main.css';

const MainLayout = () => {
  const { currentView } = useShop();

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'shop':
        return <ShopView />;
      case 'product':
        return <ProductDetailView />;
      case 'about':
        return <AboutView />;
      case 'journal':
        return <JournalView />;
      case 'contact':
        return <ContactView />;
      case 'checkout':
        return <CheckoutView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        {renderView()}
      </main>
      <Footer />
      
      {/* Global Interactivity Drawers & Modals */}
      <CartDrawer />
      <SearchModal />
      <QuickViewModal />
      <SkincareQuiz />
      <RitualTimerModal />
      <SkinConciergeChat />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <MainLayout />
    </ShopProvider>
  );
}
