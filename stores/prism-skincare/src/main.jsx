import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { PRODUCTS } from './data/products';

// Prism demo: /store/?clone=1 renders the copycat's "Prism Skincare Outlet" from the data it scraped.
async function applyCloneMode() {
  if (!new URLSearchParams(window.location.search).has('clone')) return;
  document.documentElement.classList.add('prism-clone');
  try {
    const { clone } = await (await fetch('/api/clone', { cache: 'no-store' })).json();
    if (!clone) return;
    for (const p of PRODUCTS) {
      const copies = clone.products.filter((c) => c.family === p.id);
      if (!copies.length) continue;
      p.description = copies[0].description; // carries the copied Prism marker
      p.sizes = p.sizes.map((s) => {
        const c = copies.find((x) => x.variant === s.size);
        return c ? { ...s, price: c.price } : s;
      });
      p.price = Math.max(...p.sizes.map((s) => s.price));
    }
    const bar = document.createElement('div');
    bar.className = 'prism-clone-bar';
    bar.textContent = `${clone.domain}  ·  OUTLET PRICES  ·  ALL SALES FINAL  ·  checkout: ${clone.checkoutDomain}`;
    document.body.prepend(bar);
  } catch {
    // Prism backend not running: show the store as-is
  }
}

applyCloneMode().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
