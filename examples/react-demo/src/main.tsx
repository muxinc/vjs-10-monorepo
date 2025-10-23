import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import '@videojs/react/skins/frosted.css';

import '@videojs/react/skins/minimal.css';

import './globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
