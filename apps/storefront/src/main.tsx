import { createRoot } from 'react-dom/client';
import { StorefrontApp } from '../../../src/page/Storefront/StorefrontApp';
import './style.css';

createRoot(document.getElementById('storefront-root')!).render(<StorefrontApp />);

