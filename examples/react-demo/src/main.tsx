import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import '@vjs-10/react/skins/frosted.css';

import '@vjs-10/react/skins/minimal.css';

import './globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
