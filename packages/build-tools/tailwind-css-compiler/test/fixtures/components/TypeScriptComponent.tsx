import React from 'react';

interface Props {
  variant: 'primary' | 'secondary';
}

export const TypedComponent: React.FC<Props> = ({ variant }) => {
  return (
    <button className={`btn ${variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'}`}>
      Typed Button
    </button>
  );
};