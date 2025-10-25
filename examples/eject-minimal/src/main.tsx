import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import MinimalPlayer from './MinimalPlayer';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MinimalPlayer />
  </StrictMode>,
);
