import * as React from 'react';
import { MediaContainer } from '../components/MediaContainer';

export const Component: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MediaContainer className="wrapper">
    {children}
    <div className="controls">
      <button>Play</button>
    </div>
  </MediaContainer>
);
