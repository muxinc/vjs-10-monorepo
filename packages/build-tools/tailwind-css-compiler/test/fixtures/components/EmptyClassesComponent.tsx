import React from 'react';

export default function EmptyClasses() {
  return (
    <>
      <div className="">Empty string</div>
      <div className="   ">Whitespace only</div>
      <div className="valid-class">Valid</div>
    </>
  );
}