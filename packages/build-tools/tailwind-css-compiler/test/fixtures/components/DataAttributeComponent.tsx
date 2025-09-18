import React from 'react';

export const DataAttributeComponent = () => {
  return (
    <button className="data-[state=open]:bg-blue-500 hover:bg-gray-100">
      Toggle
    </button>
  );
};