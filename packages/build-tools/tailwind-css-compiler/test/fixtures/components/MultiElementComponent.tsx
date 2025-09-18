import React from 'react';

export const MultiElementComponent = () => {
  return (
    <div>
      <button className="btn-primary">Button</button>
      <input className="input-field" />
      <PlayIcon className="icon-play" />
      <CustomRange className="range-slider" />
    </div>
  );
};