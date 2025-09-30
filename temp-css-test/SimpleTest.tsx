import * as React from 'react';

export const SimpleTest: React.FC = () => {
  return (
    <div className="bg-blue-500 p-4 rounded-lg shadow-md">
      <button className="bg-white text-blue-500 px-3 py-2 rounded hover:bg-gray-100 transition-colors">
        Click me
      </button>
      <p className="text-white mt-2 font-semibold">Simple test component</p>
    </div>
  );
};