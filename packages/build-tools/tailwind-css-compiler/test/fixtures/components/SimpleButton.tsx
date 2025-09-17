import React from 'react';

export interface SimpleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const SimpleButton: React.FC<SimpleButtonProps> = ({ children, onClick }) => {
  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onClick={onClick}
    >
      {children}
    </button>
  );
};