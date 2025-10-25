import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import FrostedPlayer from './FrostedPlayer';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FrostedPlayer />
  </StrictMode>,
);
