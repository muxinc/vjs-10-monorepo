import React from 'react';

import MediaSkinDefault from './MediaSkinDefault.tsx';

import './App.css';

function App() {
  return (
    <div className="demo-container">
      <h1>React Demo</h1>
      <div className="video-wrapper">
        <MediaSkinDefault />
      </div>
    </div>
  );
}

export default App;
