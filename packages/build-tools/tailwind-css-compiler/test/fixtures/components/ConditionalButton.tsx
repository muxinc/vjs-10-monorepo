import React from 'react';

export const ConditionalButton = ({ isActive }: { isActive: boolean }) => {
  return (
    <button className={`bg-blue-500 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}>
      Click me
    </button>
  );
};