import React from 'react';

export default function ConditionalComponent({ isActive }: { isActive: boolean }) {
  return (
    <div className={`base-class ${isActive ? 'hover:bg-blue-500 data-[active]:text-white' : 'disabled:opacity-50'}`}>
      Content
    </div>
  );
}