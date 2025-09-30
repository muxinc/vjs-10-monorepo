/**
 * Stub MediaSkinDefault for E2E Testing
 *
 * This is a minimal implementation that matches the structure of the compiled
 * web component output for equivalence testing. It doesn't include full functionality,
 * just enough to test style and structure equivalence.
 */

import React from 'react';

import './MediaSkinDefault.css';

export default function MediaSkinDefault() {
  return (
    <div className="media-container" data-media-container>
      <video
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        preload="metadata"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* Background gradient overlay */}
      <div className="overlay" aria-hidden="true" />

      {/* Controls */}
      <div className="controls" data-testid="media-controls">
        <button className="button icon-button play-button">
          <span className="play-icon">▶</span>
          <span className="pause-icon">⏸</span>
        </button>

        <div className="time-controls">
          <span className="time-display">0:00</span>

          <div className="range-root">
            <div className="range-track">
              <div className="range-progress" />
              <div className="range-pointer" />
            </div>
            <div className="range-thumb" />
          </div>

          <span className="time-display">0:00</span>
        </div>

        <button className="button icon-button mute-button">
          <span className="volume-high-icon">🔊</span>
          <span className="volume-low-icon">🔉</span>
          <span className="volume-off-icon">🔇</span>
        </button>

        <button className="button icon-button fullscreen-button">
          <span className="fullscreen-enter-icon">⛶</span>
          <span className="fullscreen-exit-icon">⛶</span>
        </button>
      </div>
    </div>
  );
}
